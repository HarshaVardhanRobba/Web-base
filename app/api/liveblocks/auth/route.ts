import { auth, currentUser } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { request } from "https"

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
}

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
})

export async function POST() {
  const { userId, orgId } = await auth()

  if (!userId) {
    return new Response("Not signed in", { status: 403 })
  }

  // Rooms are scoped to an organization, so a user without an active one has
  // nothing to join.
  if (!orgId) {
    return new Response("No active organization", { status: 403 })
  }

  const user = await currentUser()

  // ID tokens carry identity only. What the user may do in a room comes from the
  // permissions set on the room itself, matched against these group ids, so
  // rooms must be created with groupsAccesses keyed by the organization id.
  const { status, body } = await liveblocks.identifyUser(
    {
      userId,
      groupIds: [orgId],
      organizationId: orgId,
    },
    {
      userInfo: {
        name: user?.fullName ?? user?.username ?? "Anonymous",
        avatar: user?.imageUrl,
      },
    }
  )

  return new Response(body, { status })
}
