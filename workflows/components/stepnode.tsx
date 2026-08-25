import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import { nodeRegistry, type StepNodeType } from "@/workflows/nodes/settings"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useLatestRunSteps } from "@/workflows/components/workflow-runs-provider"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  // Every field the node type declares, filled or not: a node that hides its
  // empty fields collapses to a bare header and gives no hint of what it still
  // needs. An unfilled field shows its placeholder greyed out instead.
  const fields = def.fields

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  // The run publishes a status per node id, so a node finds its own by matching
  // on id. A node the last run never reached has none.
  const { steps, isLive } = useLatestRunSteps()
  const step = steps.find((entry) => entry.id === id)
  const status = step?.status

  // A run that ends mid-step leaves its last published status behind, so the
  // node it died on stays marked running forever. Only a live run can actually
  // have a step in flight, which is what stops the spinner.
  const isRunning = status === "running" && isLive
  const isFailed = status === "failed"

  return (
    <div
      className={cn(
        "max-w-80 min-w-50 rounded-(--radius) border-2 border-border bg-card text-card-foreground",
        isRunning && "border-blue-500",
        isFailed && "border-destructive",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%, -50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-border!"
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def.accent
          )}
        >
          {isRunning ? (
            <Spinner className="size-4" />
          ) : (
            <Icon className="size-4" />
          )}
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>

      {fields.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="flex flex-col gap-1.5 px-3 py-2.5">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="shrink-0 text-muted-foreground">
                  {field.label}
                </span>
                <span
                  className={cn(
                    "truncate font-medium",
                    !values[field.key] && "font-normal text-muted-foreground/60"
                  )}
                >
                  {values[field.key] || field.placeholder || "Not set"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {step?.output ? (
        <>
          <div className="border-t border-border" />
          <div className="px-3 py-2.5">
            <p className="line-clamp-3 text-xs wrap-break-word text-muted-foreground">
              {step.output}
            </p>
          </div>
        </>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%, -50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-border!"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)
