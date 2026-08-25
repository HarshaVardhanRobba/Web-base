// The tag every run of one workflow carries, so the canvas can subscribe to all
// of them without knowing any run id up front. Shared by the trigger helper that
// writes it and the provider that subscribes by it, so the two cannot drift.
export function workflowRunsTag(workflowId: string) {
  return `workflow:${workflowId}`
}
