import { auth } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { auth as triggerAuth } from "@trigger.dev/sdk"
import { ReactFlowProvider } from "@xyflow/react"
import { notFound } from "next/navigation"

import { Room } from "@/workflows/components/room"
import { WorkflowRunsProvider } from "@/workflows/components/workflow-runs-provider"
import { WorkflowShell } from "@/workflows/components/workflow-shell"
// Configures the SDK with this project key naming, for createPublicToken below.
import "@/workflows/lib/trigger-client"
import { workflowRunsTag } from "@/workflows/lib/run-tags"
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

  // Read only, and only for the runs of this one workflow: the token goes to the
  // browser, so it can do nothing beyond following this canvas. An hour outlives
  // a normal editing session without leaving a long-lived token lying around.
  const runsAccessToken = await triggerAuth.createPublicToken({
    scopes: { read: { tags: [workflowRunsTag(id)] } },
    expirationTime: "1h",
  })

  return (
    <Room roomId={id}>
      {/* The palette in the sidebar adds nodes to the canvas, so both have to
          read the same React Flow store. The provider sits above the shell,
          which renders the canvas and the sidebar side by side. */}
      <ReactFlowProvider>
        {/* One subscription to this workflow's runs, shared by everything on
            the canvas, so a step status is read from the same socket wherever
            it is shown. */}
        <WorkflowRunsProvider workflowId={id} accessToken={runsAccessToken}>
          <WorkflowShell workflowId={id} />
        </WorkflowRunsProvider>
      </ReactFlowProvider>
    </Room>
  )
}
