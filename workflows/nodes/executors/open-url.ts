import type { Stagehand } from "@browserbasehq/stagehand"

export async function openUrl({
  stagehand,
  url,
}: {
  stagehand: Stagehand
  url?: string
}) {
  const target = url?.trim()

  if (!target) {
    throw new Error("Open URL node needs a url")
  }

  const page =
    stagehand.context.pages()[0] ?? (await stagehand.context.newPage())

  // domcontentloaded rather than a fixed sleep: act() and extract() reason over
  // the DOM, so waiting for every image to land buys nothing.
  await page.goto(target, { waitUntil: "domcontentloaded", timeoutMs: 30_000 })

  return { url: page.url(), title: await page.title() }
}
