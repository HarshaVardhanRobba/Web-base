import type { Stagehand } from "@browserbasehq/stagehand"

export async function observe({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction?: string
}) {
  const step = instruction?.trim()

  if (!step) {
    throw new Error("Observe node needs an instruction")
  }

  const matches = await stagehand.observe(step)

  return {
    // method and arguments ride along even though the manifest doesn't show
    // them: an Act node fed one of these matches passes it straight to
    // Stagehand's deterministic act(), which needs them to know how to click
    // or fill the element rather than falling back to an empty method.
    matches: matches.map((match) => ({
      selector: match.selector,
      description: match.description,
      method: match.method,
      arguments: match.arguments,
    })),
  }
}
