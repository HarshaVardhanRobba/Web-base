"use client"

import { useRealtimeRun } from "@trigger.dev/react-hooks"

import type { helloWorldTask } from "@/src/trigger/example"
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
  const { run, error } = useRealtimeRun<typeof helloWorldTask>(runId, {
    accessToken,
    // The payload is only the message we already sent, so keep it off the wire.
    skipColumns: ["payload"],
  })

  if (error) {
    return (
      <p className="text-destructive text-xs">Realtime error: {error.message}</p>
    )
  }

  if (!run) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground text-xs">
        <Spinner className="size-3" />
        Connecting to run
      </p>
    )
  }

  const isRunning = !FINISHED_STATUSES.includes(run.status)

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex items-center gap-2">
        <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
        {isRunning ? <Spinner className="size-3" /> : null}
      </div>

      <p className="font-mono text-muted-foreground text-[11px] break-all">
        {run.id}
      </p>

      {run.output ? (
        <p className="text-xs">{run.output.message}</p>
      ) : null}

      {run.error ? (
        <p className="text-destructive text-xs">{run.error.message}</p>
      ) : null}
    </div>
  )
}
