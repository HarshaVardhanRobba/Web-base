"use client"

import { PlayIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { runWorkflowAction } from "@/workflows/actions"
import { RunFeedback } from "@/workflows/components/run-feedback"

type RunHandle = { runId: string; publicAccessToken: string }

export function RightSidebar() {
  const [isPending, startTransition] = useTransition()
  const [handle, setHandle] = useState<RunHandle | null>(null)

  function handleRun() {
    startTransition(async () => {
      try {
        setHandle(await runWorkflowAction())
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not start the run"
        )
      }
    })
  }

  return (
    <div className="flex size-full flex-col gap-3 p-3">
      <Button onClick={handleRun} disabled={isPending}>
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <PlayIcon data-icon="inline-start" />
        )}
        {isPending ? "Starting" : "Run"}
      </Button>

      {handle ? (
        <RunFeedback
          key={handle.runId}
          runId={handle.runId}
          accessToken={handle.publicAccessToken}
        />
      ) : null}
    </div>
  )
}
