"use client"

import Image from "next/image"
import { MousePointer2Icon } from "lucide-react"

import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const collaborators = [
  {
    name: "Maya",
    color: "#0ea5e9",
    drift: "marketing-drift-a",
    park: { left: "12%", top: "24%" },
  },
  {
    name: "Tomas",
    color: "#f59e0b",
    drift: "marketing-drift-b",
    park: { left: "72%", top: "64%" },
  },
  {
    name: "Priya",
    color: "#10b981",
    drift: "marketing-drift-c",
    park: { left: "42%", top: "76%" },
  },
]

function CanvasPreview() {
  return (
    <section id="canvas" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[110rem]">
        <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl text-2xl font-medium tracking-[-0.03em] text-foreground md:text-4xl">
            One canvas, the whole run
          </h2>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Workflows live on a shared canvas. Teammates move nodes next to you,
            and the inspector on the right holds the fields for whichever step
            is selected.
          </p>
        </Reveal>

        <Reveal className="relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)]">
          <Image
            src="/marketing/workflow-canvas.png"
            alt="The workflow builder with the sidebar of workflows, a node canvas and the node inspector"
            width={3452}
            height={2168}
            sizes="(max-width: 768px) 100vw, 90vw"
            className="h-auto w-full"
            loading="lazy"
          />

          {collaborators.map((collaborator) => (
            <span
              key={collaborator.name}
              aria-hidden
              style={{ color: collaborator.color, ...collaborator.park }}
              className={cn(
                "absolute hidden items-center gap-1.5 md:flex",
                collaborator.drift
              )}
            >
              <MousePointer2Icon
                className="size-4"
                style={{ fill: collaborator.color }}
              />
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.06em] text-background uppercase"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name}
              </span>
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export { CanvasPreview }
