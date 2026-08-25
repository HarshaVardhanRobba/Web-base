import type { Stagehand } from "@browserbasehq/stagehand"

export async function act({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction?: string
}) {
  const step = instruction?.trim()

  if (!step) {
    throw new Error("Act node needs an instruction")
  }

  const page =
    stagehand.context.pages()[0] ?? (await stagehand.context.newPage())

  // observe() first, then act on the action it returns. The action is what the
  // cache stores, so a repeat run replays it without paying for inference
  // again. A miss falls back to the plain instruction.
  const [action] = await stagehand.observe(step)
  const result = action
    ? await stagehand.act(action)
    : await stagehand.act(step)

  // A failed act is reported rather than thrown: the run continues and a
  // downstream node decides what an unsuccessful click means. The url is read
  // after the act because the action itself may have navigated.
  return { success: result.success, message: result.message, url: page.url() }
}
