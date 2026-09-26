import type { Variables } from "@browserbasehq/stagehand"

// Env vars carrying this prefix are exposed to a run as Stagehand variables:
// WORKFLOW_SECRET_LINKEDIN_PASSWORD becomes LINKEDIN_PASSWORD, which a node
// field references as %LINKEDIN_PASSWORD%.
//
// The token is what gets typed into the canvas, so it is the token — never the
// value — that is stored in the graph, synced through Liveblocks, written to
// the workflows table, and published to run metadata. Stagehand puts only the
// variable names in the model prompt and substitutes the value into the
// Playwright argument at the moment of the action, so the secret never reaches
// an LLM either.
const PREFIX = "WORKFLOW_SECRET_"

export function workflowSecrets(): Variables | undefined {
  const entries = Object.entries(process.env).flatMap(([key, value]) =>
    key.startsWith(PREFIX) && value
      ? ([[key.slice(PREFIX.length), value]] as const)
      : []
  )

  // undefined rather than an empty object: Stagehand skips the whole variable
  // path when there is nothing to substitute.
  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}
