import type { Stagehand } from "@browserbasehq/stagehand"

export async function agent({
  stagehand,
  goal,
}: {
  stagehand: Stagehand
  goal?: string
}) {
  const target = goal?.trim()

  if (!target) {
    throw new Error("Agent node needs a goal")
  }

  // No scripted steps: the agent decides them at runtime. This is the node that
  // spends the most Model Gateway tokens.
  const result = await stagehand.agent().execute(target)

  if (!result.success) {
    throw new Error(result.message)
  }

  return result.message
}
