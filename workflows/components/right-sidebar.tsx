"use client"

import { useState, useTransition } from "react"
import { useNodes, useReactFlow, useStoreApi } from "@xyflow/react"
import { MoreHorizontal, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { deleteWorkflowAction } from "@/workflows/actions"

import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/workflows/nodes/settings"

// This file builds up to the RightSidebar component exported at the bottom: a
// header with workflow actions (delete, run), then two tabs — a Toolbar for
// adding nodes and an Editor for tweaking the selected node. Each helper below is
// defined just above the block that uses it.

// ---------------------------------------------------------------------------
// Shared pieces — used by both the Toolbar and the Editor.
// ---------------------------------------------------------------------------

// The accent-colored icon chip, mirroring the node on the canvas.
function NodeIcon({ type, className }: { type: NodeType; className?: string }) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}

// A titled, scrollable panel. Each tab renders its content inside one.
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single labelled editor field for a node property. A field that declares
// itself multiline gets a text area, everything else a single-line input.
function Field({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  const Control = field.multiline ? Textarea : Input

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field.key} className="text-xs">
        {field.label}
      </Label>
      <Control
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(field.multiline && "min-h-24 text-sm")}
      />
    </div>
  )
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(value) =>
                // The updater form reads the node as it is in the store, so
                // fast typing cannot write back a stale values object. The edit
                // lands as a replace change on onNodesChange, which is what
                // puts it into Liveblocks Storage for the whole room.
                updateNodeData(node.id, (current) => ({
                  values: { ...current.data.values, [field.key]: value },
                }))
              }
            />
          ))
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one accordion section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// Roughly the size a step node renders at, used to drop a new node centered on
// the view rather than hanging off its center point. The real size is only known
// once the node has been measured, so this stays an approximation.
const NODE_SIZE = { width: 200, height: 52 }

// The next title for a node type: "Open URL 1", "Open URL 2", and so on. Numbers
// already in use are skipped, and so is any unnumbered node of the same type, so
// a title never repeats.
function nextTitle(label: string, siblings: StepNodeType[]) {
  let highest = siblings.length

  for (const sibling of siblings) {
    const suffix = sibling.data.title.startsWith(`${label} `)
      ? sibling.data.title.slice(label.length + 1)
      : ""

    // Only a plain number counts, so "Open URL 2" is a sibling of "Open URL"
    // but "Open URL copy" is left alone.
    if (suffix !== "" && /^[0-9]+$/.test(suffix)) {
      highest = Math.max(highest, Number(suffix))
    }
  }

  return `${label} ${highest + 1}`
}

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  const { getNodes, addNodes, screenToFlowPosition } =
    useReactFlow<StepNodeType>()
  const store = useStoreApi()

  const add = (type: NodeType) => {
    const def = nodeRegistry[type]
    const nodes = getNodes()

    // A workflow starts in one place, so a second trigger has nothing to mean.
    if (def.kind === "trigger" && nodes.some((n) => n.data.kind === "trigger")) {
      toast.error("A workflow can only have one trigger")
      return
    }

    // The canvas pane is what the user is looking at, so its center in screen
    // coordinates is the point to translate into the flow.
    const rect = store.getState().domNode?.getBoundingClientRect()
    const center = rect
      ? screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      : { x: 0, y: 0 }

    // addNodes reports an add change through onNodesChange, which is where
    // Liveblocks picks it up and writes it to Storage for everyone in the room.
    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position: {
        x: center.x - NODE_SIZE.width / 2,
        y: center.y - NODE_SIZE.height / 2,
      },
      data: {
        type,
        kind: def.kind,
        title: nextTitle(
          def.label,
          nodes.filter((n) => n.data.type === type)
        ),
        values: {},
      },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// The "..." menu for workflow-level actions.
function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isDeleting, startDeleting] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          disabled={isDeleting}
          className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
          onSelect={(event) => {
            // The action redirects when it is done, so the menu stays open and
            // the item stays disabled for as long as the delete is in flight.
            event.preventDefault()

            startDeleting(async () => {
                await deleteWorkflowAction(workflowId)
            })
          }}
        >
          <Trash2 />
          {isDeleting ? "Deleting..." : "Delete workflow"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Kicks off a run of the current workflow.
function RunButton() {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        // TODO: validate the graph and run the workflow (toggle to Stop while running).
      }}
    >
      <Play fill="primary" />
      Run
    </Button>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")

  // The nodes come from the shared React Flow store, so the sidebar sees the
  // same selection the canvas does.
  const nodes = useNodes<StepNodeType>()
  const selected = nodes.find((node) => node.selected)

  // TODO: auto-switch to the Editor tab when the selection changes.

  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2">
          <ActionsMenu workflowId={workflowId} />
          <RunButton />
        </div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger
            value="toolbar"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Toolbar
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}