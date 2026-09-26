"use client"

import { useRealtimeRun, useWaitToken } from "@trigger.dev/react-hooks"

import type {
  PendingVerification,
  runWorkflowTask,
  RunStep,
} from "@/workflows/tasks/run-workflow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

// Shown only while a step is stalled on a security checkpoint. Solving the
// checkpoint happens by hand in the Live View tab; this button just tells the
// paused run to carry on once that is done.
function VerificationBanner({
  verification,
}: {
  verification: PendingVerification
}) {
  const { complete, isLoading, isCompleted, error } = useWaitToken(
    verification.tokenId,
    { accessToken: verification.publicToken }
  )

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 p-2">
      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
        Security verification needed
      </p>
      <p className="text-xs text-muted-foreground">
        Open the Live View above, clear the check on the page, then resume.
      </p>
      <p className="font-mono text-[11px] break-all text-muted-foreground">
        {verification.url}
      </p>
      <Button
        className="w-fit"
        disabled={isLoading || isCompleted}
        onClick={() => complete({})}
        size="sm"
      >
        {isCompleted ? "Resuming" : isLoading ? "Resuming" : "Resume run"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error.message}</p>
      ) : null}
    </div>
  )
}

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
  // before the run finishes rather than only in the final output. verification
  // only exists while a step is paused on a checkpoint, and is absent otherwise.
  const metadata = run.metadata as
    | {
        steps?: RunStep[]
        sessionUrl?: string
        verification?: PendingVerification
      }
    | undefined
  const steps = metadata?.steps ?? run.output?.steps ?? []
  const sessionUrl = metadata?.sessionUrl ?? run.output?.sessionUrl
  const verification = metadata?.verification

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

      {verification ? <VerificationBanner verification={verification} /> : null}

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
