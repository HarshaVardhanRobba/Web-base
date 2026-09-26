import type { Stagehand } from "@browserbasehq/stagehand"

import { workflowSecrets } from "../../lib/secrets"
import {
  looksLikeVerification,
  VerificationRequiredError,
} from "../../lib/verification"

export async function agent({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction?: string
}) {
  const target = instruction?.trim()

  if (!target) {
    throw new Error("Agent node needs an instruction")
  }

  // No scripted steps: the agent decides them at runtime. This is the node that
  // spends the most Model Gateway tokens. Variables let the agent fill a login
  // form from a %TOKEN% without the secret entering its prompt: only the names
  // are described to it, and the value is substituted as it types.
  const result = await stagehand.agent().execute({
    instruction: target,
    variables: workflowSecrets(),
  })

  const url = stagehand.context.pages()[0]?.url() ?? ""

  if (looksLikeVerification(url, result.message)) {
    throw new VerificationRequiredError(url)
  }

  // An unsuccessful agent is reported rather than thrown, the same as an Act:
  // the run continues and a downstream node decides what it means. completed
  // is separate from success — an agent that runs out of steps mid-task comes
  // back incomplete rather than failed.
  return {
    success: result.success,
    message: result.message,
    completed: result.completed,
  }
}
