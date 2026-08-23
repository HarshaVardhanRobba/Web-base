"use client"

import {
  addEdge,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import type { Connection, Edge, NodeTypes } from "@xyflow/react"
import { useTheme } from "next-themes"
import { useCallback } from "react"

import { StepNode } from "./stepnode"
import { nodeRegistry, type StepNodeType } from "../nodes/settings"

import "@xyflow/react/dist/style.css"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "1",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start",
      kind: nodeRegistry.start.kind,
      title: nodeRegistry.start.label,
      values: {},
    },
  },
  {
    id: "2",
    type: "step",
    position: { x: 0, y: 140 },
    data: {
      type: "open-url",
      kind: nodeRegistry["open-url"].kind,
      title: nodeRegistry["open-url"].label,
      values: {},
    },
  },
]

// The two seed nodes start unconnected, so drag from a handle to link them.
const initialEdges: Edge[] = []

export function Canvas() {
  // next-themes drives the theme through a class, which React Flow does not
  // read. Its own "system" mode follows the OS instead, so the two can disagree
  // and leave light nodes on a dark canvas. Pass the resolved theme instead.
  const { resolvedTheme } = useTheme()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges]
  )

  // ReactFlow needs a parent with an explicit width and height.
  return (
    <div className="size-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        defaultEdgeOptions={{ type: "default" }}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.4 }}
      >
        <Controls />
      </ReactFlow>
    </div>
  )
}
