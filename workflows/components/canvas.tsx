"use client"

import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"
import { Controls, ReactFlow } from "@xyflow/react"
import type { Edge, EdgeTypes, NodeTypes } from "@xyflow/react"
import { useTheme } from "next-themes"

import { ShinyEdge, SHINY_EDGE_GRADIENT_ID } from "./shiny-edge"
import { StepNode } from "./stepnode"
import { nodeRegistry, type StepNodeType } from "../nodes/settings"

import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

import "@xyflow/react/dist/style.css"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const edgeTypes: EdgeTypes = {
  shiny: ShinyEdge,
}

// The gradient every ShinyEdge paints its stroke with, defined once here since
// an SVG id is document-global. offset colors read CSS variables so the edge
// stays on-theme in both light and dark mode without its own switch.
function ShinyEdgeDefs() {
  return (
    <svg width={0} height={0}>
      <defs>
        <linearGradient id={SHINY_EDGE_GRADIENT_ID}>
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="50%" stopColor="var(--color-ring)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
    </svg>
  )
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

  // Nodes and edges live in Liveblocks Storage, seeded once from the initial
  // arrays. suspense: true means nodes and edges are never null, so this must
  // render under a ClientSideSuspense boundary inside a room.
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<StepNodeType, Edge>({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    })

  // ReactFlow needs a parent with an explicit width and height.
  return (
    <div className="size-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        // React Flow only listens for Backspace by default, which leaves the
        // Delete key doing nothing. Both keys remove the current selection, and
        // the edges attached to a removed node go with it.
        deleteKeyCode={["Delete", "Backspace"]}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        defaultEdgeOptions={{ type: "shiny" }}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.4 }}
      >
        <ShinyEdgeDefs />
        <Controls />
        <Cursors />
      </ReactFlow>
    </div>
  )
}
