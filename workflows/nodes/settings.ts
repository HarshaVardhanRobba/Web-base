import type { Node } from "@xyflow/react"
import {
  Bot,
  Camera,
  Globe,
  MousePointerClick,
  Pointer,
  ScanText,
  Search,
  type LucideIcon,
} from "lucide-react"

export type StepNodeKind = "trigger" | "action"

// One editable field on a node, rendered as an input in the inspector. Set
// multiline on a field that holds more than a line of text, such as a body or a
// script, and the inspector gives it a text area instead of a single-line input.
export type NodeField = {
  key: string
  label: string
  placeholder?: string
  multiline?: boolean
}

export type NodeOutput = {
  path: string
  label: string
}

// A node type's manifest entry. Add a node by adding an entry to nodeRegistry.
export type NodeDefinition = {
  type: string
  kind: StepNodeKind
  label: string
  icon: LucideIcon
  accent: string // Tailwind classes for the icon chip color
  fields: NodeField[]
  outputs: NodeOutput[]
}

export const nodeRegistry = {
  start: {
    type: "start",
    kind: "trigger",
    label: "Start",
    icon: MousePointerClick,
    accent: "bg-blue-500 text-white",
    fields: [],
    outputs: [],
  },
  "open-url": {
    type: "open-url",
    kind: "action",
    label: "Open URL",
    icon: Globe,
    accent: "bg-emerald-500 text-white",
    fields: [{ key: "url", label: "URL", placeholder: "https://youtube.com" },{ key: "Method", label: "Method", placeholder: "POST" }],
    outputs: [
      { path: "url", label: "URL" },
      { path: "title", label: "Title" }
    ],
  },
  act: {
    type: "act",
    kind: "action",
    label: "Act",
    icon: Pointer,
    accent: "bg-violet-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Click the first search result",
        multiline: true,
      },
    ],
    outputs: [
      { path: "success", label: "Worked" },
      { path: "message", label: "Message" },
      { path: "url", label: "URL" },
    ],
  },
  extract: {
    type: "extract",
    kind: "action",
    label: "Extract",
    icon: ScanText,
    accent: "bg-amber-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "The price of the first listing",
        multiline: true,
      },
    ],
    outputs: [{ path: "extraction", label: "Extraction" }],
  },
  "screenshot": {
    type: "screenshot",
    kind: "action",
    label: "screenshot",
    icon: Camera,
    accent: "bg-rose-500 text-white",
    fields: [],
    outputs: [{ path: "screenshot", label: "Screenshot" }],
  },
  observe: {
    type: "observe",
    kind: "action",
    label: "Observe",
    icon: Search,
    accent: "bg-sky-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Find the add to cart button",
        multiline: true,
      },
    ],
    outputs: [{ path: "matches", label: "Matches" }],
  },
  agent: {
    type: "agent",
    kind: "action",
    label: "Agent",
    icon: Bot,
    accent: "bg-fuchsia-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Search for an HDMI cable and open the first result",
        multiline: true,
      },
    ],
    outputs: [
      { path: "success", label: "Worked" },
      { path: "message", label: "Message" },
      { path: "completed", label: "Completed" },
    ],
  },

} satisfies Record<string, NodeDefinition>

export type NodeType = keyof typeof nodeRegistry

// Plain JSON only (synced through Liveblocks later). type keys into the registry;
// kind and title are denormalized so the server can read them without the registry.
export type StepNodeData = {
  type: NodeType
  kind: StepNodeKind
  title: string
  values: Record<string, string>
}

export type StepNodeType = Node<StepNodeData, "step">