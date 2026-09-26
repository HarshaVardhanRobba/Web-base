import { memo } from "react"
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react"

// One gradient, shared by every edge instance rather than declared per-edge:
// an SVG id is global to the document, so a second <linearGradient> with the
// same id would just be a duplicate paint no edge needs. Rendered once from
// Canvas, referenced here by url(#shiny-edge-gradient).
export const SHINY_EDGE_GRADIENT_ID = "shiny-edge-gradient"

function ShinyEdgeComponent({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{
        stroke: `url(#${SHINY_EDGE_GRADIENT_ID})`,
        strokeWidth: selected ? 3 : 2,
        filter: selected
          ? "drop-shadow(0 0 6px var(--color-ring))"
          : "drop-shadow(0 0 2px var(--color-ring))",
      }}
    />
  )
}

export const ShinyEdge = memo(ShinyEdgeComponent)
