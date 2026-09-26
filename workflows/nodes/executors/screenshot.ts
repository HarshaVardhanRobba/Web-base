import type { Stagehand } from "@browserbasehq/stagehand"

export async function screenshot({
  stagehand
}: {
  stagehand: Stagehand
}) {

  const page =
    stagehand.context.pages()[0] ?? (await stagehand.context.newPage())

  // domcontentloaded rather than a fixed sleep: act() and extract() reason over 

  const buffer = await page.screenshot({ type: "png" })

  return { screenshot: buffer.toString("base64") }
}