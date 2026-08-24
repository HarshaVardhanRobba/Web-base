import type { Stagehand } from "@browserbasehq/stagehand"

export async function extract({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction?: string
}) {
  const step = instruction?.trim()

  if (!step) {
    throw new Error("Extract node needs an instruction")
  }

  const { extraction } = await stagehand.extract(step)

  return extraction
}
