import { nodeRegistry, type NodeDefinition } from "@/workflows/nodes/settings"

// Hex mirrors of the Tailwind chip colors in the node registry, needed because
// the WebGL scene cannot read Tailwind classes.
const accentHex: Record<string, string> = {
  start: "#3b82f6",
  "open-url": "#10b981",
  act: "#8b5cf6",
  extract: "#f59e0b",
  screenshot: "#f43f5e",
  observe: "#0ea5e9",
  agent: "#d946ef",
}

const summaries: Record<string, string> = {
  start: "Opens the run and hands a fresh browser session to the next step.",
  "open-url":
    "Points the browser at an address and waits for the page to settle.",
  act: "Click, type or scroll, described in plain language instead of selectors.",
  extract: "Pulls structured data off the page against a shape you describe.",
  screenshot: "Captures the viewport so a run can be reviewed later.",
  observe: "Asks what is on the page and returns the elements that match.",
  agent: "Hands a goal to an agent that keeps acting until the goal is met.",
}

export type MarketingNode = {
  definition: NodeDefinition
  hex: string
  summary: string
  outputTag: string
}

export const marketingNodes: MarketingNode[] = Object.values(
  nodeRegistry as Record<string, NodeDefinition>
).map((definition) => ({
  definition,
  hex: accentHex[definition.type] ?? "#3b82f6",
  summary: summaries[definition.type] ?? "",
  outputTag: definition.outputs.length
    ? definition.outputs.map((output) => output.path).join(" · ")
    : "run.id",
}))

export const accentPalette = marketingNodes.map((node) => node.hex)
