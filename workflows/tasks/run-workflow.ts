import { logger, metadata, task } from "@trigger.dev/sdk"
import toposort from "toposort"
import { createBrowser, sessionUrl } from "../lib/browserbase"
import { nodeExecutors } from "../nodes/node-executors"
import { getWorkflow } from "../test-data-lib/data"

// One entry per node the run will touch, written to run metadata as it changes
// so the canvas can follow along without polling.
export type StepProgress = {
  id: string
  title: string
  status: "pending" | "running" | "completed" | "failed"
  output?: string
  error?: string
}

// What the task needs to find the graph it should run. Exported so the server
// action side cannot drift from it.
export type RunWorkflowPayload = { workflowId: string; orgId: string }

// sessions) gets layered on from here.
export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: RunWorkflowPayload) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) throw new Error(`Workflow ${workflowId} has no graph`)

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // Run only connected nodes - anything touching an edge. Orphans dropped on
    // the canvas are skipped. toposort orders them and throws on a cycle.
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
    const order = toposort
      .array(
        nodes.map((n) => n.id),
        edges.map((e): [string, string] => [e.source, e.target])
      )
      .filter((id) => connected.has(id))

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    const steps: StepProgress[] = order.map((id) => ({
      id,
      title: byId.get(id)!.data.title,
      status: "pending",
    }))

    const publish = () => metadata.set("steps", steps)

    publish()

    const browser = createBrowser()
    let published = false

    // The session id only exists once a node has opened the browser, so the
    // Live View link goes out on the first step that needs one.
    const publishSession = () => {
      const id = browser.sessionId()

      if (id && !published) {
        published = true
        metadata.set("sessionUrl", sessionUrl(id))
        logger.log(`Watch this run at ${sessionUrl(id)}`)
      }
    }

    try {
      for (const [index, id] of order.entries()) {
        const node = byId.get(id)!
        const step = steps[index]

        logger.log(`Running step: ${node.data.title}`)
        step.status = "running"
        publish()

        try {
          step.output = await nodeExecutors[node.data.type]({
            values: node.data.values,
            getStagehand: browser.getStagehand,
          })
          step.status = "completed"
        } catch (error) {
          step.status = "failed"
          step.error = error instanceof Error ? error.message : String(error)
          publish()
          publishSession()

          // A failed step leaves the browser somewhere unexpected, so the rest
          // of the graph would run against the wrong page. Stop the run instead.
          throw error
        }

        publish()
        publishSession()
      }

      return {
        steps: steps.length,
        sessionUrl: browser.sessionId()
          ? sessionUrl(browser.sessionId()!)
          : undefined,
        results: steps,
      }
    } finally {
      await browser.close()

      // Metadata is batched, and the run ends before the next flush lands, so
      // the last step would stay stuck on running in the UI without this.
      await metadata.flush()
    }
  },
})
