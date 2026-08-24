import { auth, clerkClient } from "@clerk/nextjs/server"

// Clerk accepts at most 100 user ids per list request.
const BATCH_SIZE = 100

export async function POST(request: Request) {
  const { userId, orgId } = await auth()

  if (!userId) {
    return new Response("Not signed in", { status: 403 })
  }

  // Resolution is scoped to the organization of the caller, so a user without
  // an active one has nobody to resolve.
  if (!orgId) {
    return new Response("No active organization", { status: 403 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  const userIds = (body as { userIds?: unknown })?.userIds

  if (
    !Array.isArray(userIds) ||
    userIds.some((id) => typeof id !== "string")
  ) {
    return new Response("userIds must be an array of strings", { status: 400 })
  }

  const uniqueIds = [...new Set(userIds as string[])]
  const client = await clerkClient()
  const byId = new Map<string, { name: string; avatar?: string }>()

  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const batch = uniqueIds.slice(i, i + BATCH_SIZE)

    // Filtering on the organization as well as the ids keeps a signed-in user
    // from resolving names and avatars outside their own organization.
    const { data } = await client.users.getUserList({
      userId: batch,
      organizationId: [orgId],
      limit: batch.length,
    })

    for (const user of data) {
      byId.set(user.id, {
        name: user.fullName ?? user.username ?? "Anonymous",
        avatar: user.imageUrl,
      })
    }
  }

  // Liveblocks matches the response positionally against the ids it asked for,
  // so unresolved users have to stay in place as null.
  const users = (userIds as string[]).map((id) => byId.get(id) ?? null)

  return Response.json(users)
}
