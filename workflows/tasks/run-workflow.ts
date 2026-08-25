import { logger, metadata, task } from "@trigger.dev/sdk"
import toposort from "toposort"
import { createBrowser, sessionUrl } from "../lib/browserbase"
import { interpolate } from "../lib/interpolate"
import { nodeExecutors } from "../nodes/node-executors"
import { getWorkflow } from "../test-data-lib/data"

// One entry per node the run will touch, written to run metadata as it changes
// so the canvas can follow along without polling. Node id and status only: the
// canvas already holds the graph, so it looks up everything else by id.
export type RunStep = {
  id: string
  status: "pending" | "running" | "done" | "failed"
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

    const steps: RunStep[] = order.map((id) => ({ id, status: "pending" }))

    // Every result produced so far, keyed by node id, so a later node can reach
    // back through a {{ nodeId.field }} placeholder. toposort already put the
    // nodes in dependency order, so anything a node names is in here by the time
    // that node runs.
    const outputs: Record<string, unknown> = {}

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

        // Metadata writes are batched and sent in the background, so "done"
        // would overwrite "running" before either left the worker and the
        // canvas would never see a step in flight. Flushing pushes it now.
        await metadata.flush()

        try {
          // Resolve placeholders against upstream output first, so the executor
          // only ever sees finished text. A field with no placeholder in it comes
          // back unchanged.
          const values = Object.fromEntries(
            Object.entries(node.data.values).map(([key, value]) => [
              key,
              interpolate(value, outputs),
            ])
          )

          const output = await nodeExecutors[node.data.type]({
            values,
            getStagehand: browser.getStagehand,
          })

          outputs[id] = output
          step.status = "done"
        } catch (error) {
          step.status = "failed"
          publish()

          // A thrown run has no output for the canvas to fall back on, so this
          // flush is the only way the failed status ever reaches it.
          await metadata.flush()
          publishSession()

          logger.error(`Step failed: ${node.data.title}`, {
            error: error instanceof Error ? error.message : String(error),
          })

          // A failed step leaves the browser somewhere unexpected, so the rest
          // of the graph would run against the wrong page. Stop the run instead.
          throw error
        }

        publish()
        publishSession()
      }

      // Returning the steps as well as publishing them means a run that
      // finishes has its final state in the output, whatever the last flush
      // managed to send.
      return {
        steps,
        sessionUrl: browser.sessionId()
          ? sessionUrl(browser.sessionId()!)
          : undefined,
      }
    } finally {
      await browser.close()

      // Metadata is batched, and the run ends before the next flush lands, so
      // the last step would stay stuck on running in the UI without this.
      await metadata.flush()
    }
  },
})
