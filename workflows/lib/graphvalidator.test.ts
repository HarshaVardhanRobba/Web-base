import { describe, expect, it } from "vitest"

import type { WorkflowGraph } from "@/lib/db/schema"
import type { StepNodeType } from "@/workflows/nodes/settings"

import { validateGraph } from "./graphvalidator"

function node(id: string, kind: "trigger" | "action" = "action"): StepNodeType {
  return {
    id,
    position: { x: 0, y: 0 },
    type: "step",
    data: { type: "act", kind, title: id, values: {} },
  }
}

function graph(nodes: StepNodeType[], edges: [string, string][]): WorkflowGraph {
  return {
    nodes,
    edges: edges.map(([source, target], i) => ({
      id: `e${i}`,
      source,
      target,
    })),
  }
}

describe("validateGraph", () => {
  it("passes a graph with one trigger, one edge, no cycle", () => {
    const nodes = [node("start", "trigger"), node("open")]
    expect(validateGraph(graph(nodes, [["start", "open"]]))).toEqual([])
  })

  it("flags zero triggers", () => {
    const nodes = [node("open")]
    expect(validateGraph(graph(nodes, []))).toContain(
      "A workflow needs exactly one Start trigger (found 0)."
    )
  })

  it("flags two triggers", () => {
    const nodes = [node("start1", "trigger"), node("start2", "trigger"), node("open")]
    expect(
      validateGraph(graph(nodes, [["start1", "open"]]))
    ).toContain("A workflow needs exactly one Start trigger (found 2).")
  })

  it("flags no edges", () => {
    const nodes = [node("start", "trigger")]
    expect(validateGraph(graph(nodes, []))).toContain(
      "Connect your nodes before running."
    )
  })

  it("flags a cycle", () => {
    const nodes = [node("start", "trigger"), node("a"), node("b")]
    const result = validateGraph(
      graph(nodes, [
        ["start", "a"],
        ["a", "b"],
        ["b", "a"],
      ])
    )
    expect(result).toContain("Workflow has a cycle — remove the loop before running.")
  })
})
