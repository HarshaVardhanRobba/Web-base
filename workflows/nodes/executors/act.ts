import type { Stagehand } from "@browserbasehq/stagehand"

import { workflowSecrets } from "../../lib/secrets"
import {
  looksLikeVerification,
  VerificationRequiredError,
} from "../../lib/verification"

// What interpolate() leaves in the instruction when an Act field is fed
// straight from an Observe node's output: one match object, or the whole
// matches array as JSON. Either shape names an exact element, so Stagehand
// can click it directly instead of resolving the page from scratch — which
// is what let the same free-text instruction land on a different, sometimes
// non-clickable element from one run to the next.
type ObserveMatch = {
  selector: string
  description: string
  method?: string
  arguments?: string[]
}

function parseMatch(step: string): ObserveMatch | undefined {
  let parsed: unknown

  try {
    parsed = JSON.parse(step)
  } catch {
    return undefined
  }

  const candidate = Array.isArray(parsed) ? parsed[0] : parsed

  // method has to be a real Playwright locator method or Stagehand's
  // deterministic path rejects it outright, so a match missing one is
  // useless here and falls through to the text-instruction path instead.
  return candidate &&
    typeof candidate === "object" &&
    typeof (candidate as ObserveMatch).selector === "string" &&
    typeof (candidate as ObserveMatch).description === "string" &&
    !!(candidate as ObserveMatch).method
    ? (candidate as ObserveMatch)
    : undefined
}

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

  const match = parseMatch(step)

  // A %TOKEN% in the instruction resolves to its secret here rather than in
  // the field, so a password reaches the page without being stored in the
  // graph or shown to a model.
  const variables = workflowSecrets()

  // observe() first, then act on the action it returns. The action is what
  // the cache stores, so a repeat run replays it without paying for
  // inference again. A miss falls back to the plain instruction.
  const result = match
    ? await stagehand.act(match, { variables })
    : await stagehand.observe(step, { variables }).then(([action]) =>
        action
          ? stagehand.act(action, { variables })
          : stagehand.act(step, { variables })
      )

  // A click that navigates does so async: the act() promise can resolve
  // before the new page has landed, so reading page.url() immediately still
  // returns the page the click happened on. Giving any in-flight navigation
  // a moment to reach domcontentloaded is a no-op when nothing is navigating,
  // since that state has already been reached.
  await page.waitForLoadState("domcontentloaded", 3_000).catch(() => {})

  const url = page.url()

  if (looksLikeVerification(url, result.message)) {
    throw new VerificationRequiredError(url)
  }

  // A failed act is reported rather than thrown: the run continues and a
  // downstream node decides what an unsuccessful click means.
  return { success: result.success, message: result.message, url }
}
