import type { Stagehand } from "@browserbasehq/stagehand"

import type { StepNodeType } from "../nodes/settings"

// Runs one node against the shared browser session and returns what it produced
// as a short string, so the result drops straight into run metadata and the logs
// panel. Throwing here fails the step, and the task decides what that means for
// the rest of the run.
export async function runStep(
  stagehand: Stagehand,
  node: StepNodeType
): Promise<string | undefined> {
  const { type, values } = node.data

  switch (type) {
    // The trigger only marks where the graph starts, so there is nothing to do.
    case "start":
      return undefined

    case "open-url": {
      const url = values.url?.trim()

      if (!url) {
        throw new Error("Open URL node needs a url")
      }

      const page =
        stagehand.context.pages()[0] ?? (await stagehand.context.newPage())

      // domcontentloaded rather than a fixed sleep: act() and extract() reason
      // over the DOM, so waiting for every image to land buys nothing.
      await page.goto(url, { waitUntil: "domcontentloaded" })

      return `Opened ${url}`
    }

    case "act": {
      const instruction = values.instruction?.trim()

      if (!instruction) {
        throw new Error("Act node needs an instruction")
      }

      // observe() first, then act on the action it returns. The action is what
      // the cache stores, so a repeat run replays it without paying for
      // inference again. A miss falls back to the plain instruction.
      const [action] = await stagehand.observe(instruction)
      const result = action
        ? await stagehand.act(action)
        : await stagehand.act(instruction)

      return result.message
    }

    case "extract": {
      const instruction = values.instruction?.trim()

      if (!instruction) {
        throw new Error("Extract node needs an instruction")
      }

      const { extraction } = await stagehand.extract(instruction)

      return extraction
    }

    case "agent": {
      const goal = values.goal?.trim()

      if (!goal) {
        throw new Error("Agent node needs a goal")
      }

      // No scripted steps: the agent decides them at runtime. This is the node
      // that spends the most Model Gateway tokens.
      const result = await stagehand.agent().execute(goal)

      if (!result.success) {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
