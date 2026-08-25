"use client"

import { useRealtimeRun } from "@trigger.dev/react-hooks"

import type { runWorkflowTask, RunStep } from "@/workflows/tasks/run-workflow"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

const FINISHED_STATUSES = [
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]

function statusVariant(status: string) {
  if (status === "COMPLETED") {
    return "secondary" as const
  }

  if (FINISHED_STATUSES.includes(status)) {
    return "destructive" as const
  }

  return "default" as const
}

export function RunFeedback({
  runId,
  accessToken,
}: {
  runId: string
  accessToken: string
}) {
  const { run, error } = useRealtimeRun<typeof runWorkflowTask>(runId, {
    accessToken,
    // The payload is only the message we already sent, so keep it off the wire.
    skipColumns: ["payload"],
  })

  if (error) {
    return (
      <p className="text-xs text-destructive">
        Realtime error: {error.message}
      </p>
    )
  }

  if (!run) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-3" />
        Connecting to run
      </p>
    )
  }

  const isRunning = !FINISHED_STATUSES.includes(run.status)

  // The task writes both of these to run metadata as it goes, so they land here
  // before the run finishes rather than only in the final output.
  const metadata = run.metadata as
    { steps?: RunStep[]; sessionUrl?: string } | undefined
  const steps = metadata?.steps ?? run.output?.steps ?? []
  const sessionUrl = metadata?.sessionUrl ?? run.output?.sessionUrl

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex items-center gap-2">
        <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
        {isRunning ? <Spinner className="size-3" /> : null}
      </div>

      <p className="font-mono text-[11px] break-all text-muted-foreground">
        {run.id}
      </p>

      {sessionUrl ? (
        <a
          className="text-xs underline"
          href={sessionUrl}
          rel="noreferrer"
          target="_blank"
        >
          Watch the browser session
        </a>
      ) : null}

      {steps.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {steps.map((step) => (
            <li className="text-xs" key={step.id}>
              <span className="text-muted-foreground">{step.status}</span>{" "}
              <span className="font-mono break-all">{step.id}</span>
              {step.output ? (
                <p className="mt-0.5 wrap-break-word text-muted-foreground">
                  {step.output}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {run.error ? (
        <p className="text-xs text-destructive">{run.error.message}</p>
      ) : null}
    </div>
  )
}
