import { auth } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { ReactFlowProvider } from "@xyflow/react"
import { notFound } from "next/navigation"

import { Room } from "@/workflows/components/room"
import { WorkflowShell } from "@/workflows/components/workflow-shell"
import { getWorkflow } from "@/workflows/test-data-lib/data"

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
}

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
})

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) {
    notFound()
  }

  // Rooms are private by default, so access has to be granted explicitly. The
  // auth endpoint puts the Clerk orgId in groupIds, which is what this key
  // matches, so every member of the owning organization can edit and nobody
  // else can join. Ownership is already proven by the getWorkflow lookup above,
  // which filters on orgId. Failures fall through to error.tsx.
  await liveblocks.getOrCreateRoom(id, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    metadata: {
      workflowName: workflow.name,
    },
  })

  return (
    <Room roomId={id}>
      {/* The palette in the sidebar adds nodes to the canvas, so both have to
          read the same React Flow store. The provider sits above the shell,
          which renders the canvas and the sidebar side by side. */}
      <ReactFlowProvider>
        <WorkflowShell workflowId={id} />
      </ReactFlowProvider>
    </Room>
  )
}
