"use client"

import { createContext, useContext, useMemo } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import { workflowRunsTag } from "@/workflows/lib/run-tags"
import type { RunStep, runWorkflowTask } from "@/workflows/tasks/run-workflow"

// The shape the realtime hook hands back, named here so the context and the
// consumers below stay tied to the installed hook rather than to a hand-written
// copy of it.
type WorkflowRuns = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>

const WorkflowRunsContext = createContext<WorkflowRuns | undefined>(undefined)

// A run counts as live while the platform still has work to do for it. Anything
// else is finished, one way or another.
const LIVE_STATUSES = ["QUEUED", "EXECUTING"]

// One subscription to every run of this workflow, shared by everything under it.
// Mounting the hook once here rather than per component means the canvas, the
// sidebar and the logs panel all read the same socket and the same runs.
export function WorkflowRunsProvider({
  workflowId,
  accessToken,
  children,
}: {
  workflowId: string
  accessToken: string
  children: React.ReactNode
}) {
  const runs = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    workflowRunsTag(workflowId),
    {
      accessToken,
      // The payload is the workflow and organization id this page already has,
      // so keep it off the wire. metadata and output are what the steps come
      // from, so both stay.
      skipColumns: ["payload"],
    }
  )

  return <WorkflowRunsContext value={runs}>{children}</WorkflowRunsContext>
}

// The shared subscription. Throws rather than returning empty when it is used
// outside the provider, so a component that silently shows nothing is caught the
// first time it renders.
export function useWorkflowRuns() {
  const runs = useContext(WorkflowRunsContext)

  if (!runs) {
    throw new Error(
      "useWorkflowRuns must be used inside a WorkflowRunsProvider"
    )
  }

  return runs
}

// The steps of the most recent run, and whether that run is still going. A
// finished run has its final steps in the output, which is the state the task
// guarantees; a run still going has only published metadata to fall back on.
export function useLatestRunSteps(): { steps: RunStep[]; isLive: boolean } {
  const { runs } = useWorkflowRuns()

  return useMemo(() => {
    // The subscription does not promise an order, so the newest run is the one
    // with the latest createdAt rather than the first or last in the array.
    const latest = runs.reduce<(typeof runs)[number] | undefined>(
      (newest, run) =>
        !newest || run.createdAt > newest.createdAt ? run : newest,
      undefined
    )

    if (!latest) return { steps: [], isLive: false }

    const published = latest.metadata?.steps as RunStep[] | undefined

    return {
      steps: latest.output?.steps ?? published ?? [],
      isLive: LIVE_STATUSES.includes(latest.status),
    }
  }, [runs])
}
