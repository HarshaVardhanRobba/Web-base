import { tasks } from "@trigger.dev/sdk"

import "./trigger-client"

import type {
  RunWorkflowPayload,
  runWorkflowTask,
} from "@/workflows/tasks/run-workflow"

// The one place that pairs a task id with the task it belongs to. Triggering by
// a bare string elsewhere let the app point at hello-world while still passing
// the type check, because the id and the type were written separately. Callers
// get no say in either one here: pass a payload, run that task.
//
// The import is type only on purpose, so the task never lands in the app bundle.
export function triggerRunWorkflow(payload: RunWorkflowPayload) {
  return tasks.trigger<typeof runWorkflowTask>("run-workflow", payload)
}
