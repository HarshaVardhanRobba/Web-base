import { useMemo } from "react"
import { getIncomers, useEdges, useNodes } from "@xyflow/react"
import type { Edge } from "@xyflow/react"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/workflows/nodes/settings"

// One value an upstream node exposes, shaped for the picker in the inspector.
// token drops straight into a field, label is what the user reads, and type keys
// into the registry for the icon and accent color.
export type UpstreamConnection = {
  token: string
  label: string
  type: NodeType
}

// Walks the graph backwards from a node and returns every node that can reach
// it, nearest first. Breadth first rather than only direct parents, so a value
// from three steps up is offered too. The seen set doubles as cycle protection,
// which matters while an edge is mid-drag and the graph is briefly not a DAG.
function collectUpstream(
  node: StepNodeType,
  nodes: StepNodeType[],
  edges: Edge[]
): StepNodeType[] {
  const seen = new Set<string>([node.id])
  const upstream: StepNodeType[] = []
  const queue = getIncomers(node, nodes, edges)

  while (queue.length > 0) {
    const current = queue.shift()!

    if (seen.has(current.id)) continue

    seen.add(current.id)
    upstream.push(current)
    queue.push(...getIncomers(current, nodes, edges))
  }

  return upstream
}

// Every output a node could reference, given what is wired above it right now.
// Reads nodes and edges from the shared React Flow store, so connecting or
// disconnecting an edge re-computes this on the next render without any manual
// invalidation. Pass the selected node, or undefined when nothing is selected.
export function useUpstreamConnections(
  node: StepNodeType | undefined
): UpstreamConnection[] {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges()

  return useMemo(() => {
    if (!node) return []

    return collectUpstream(node, nodes, edges).flatMap((source) =>
      nodeRegistry[source.data.type].outputs.map((output) => ({
        // The run keys its outputs by node id, so the token carries the id even
        // though the label the user sees never shows it.
        token: `{{ ${source.id}.${output.path} }}`,
        label: `${source.data.title} · ${output.label}`,
        type: source.data.type,
      }))
    )
  }, [node, nodes, edges])
}
