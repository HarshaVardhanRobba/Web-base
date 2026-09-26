"use client"

import * as React from "react"

import { marketingNodes } from "@/components/marketing/nodes"
import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

function NodeIndex() {
  const [activeType, setActiveType] = React.useState(
    marketingNodes[0].definition.type
  )
  const active =
    marketingNodes.find((node) => node.definition.type === activeType) ??
    marketingNodes[0]

  return (
    <section id="nodes" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[110rem] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Reveal className="mb-10">
            <h2 className="max-w-xl text-2xl font-medium tracking-[-0.03em] text-foreground md:text-4xl">
              Seven nodes, no scripting
            </h2>
          </Reveal>

          <Reveal selector="[data-node-row]" y={20} stagger={0.06}>
            <ul className="border-t border-border">
              {marketingNodes.map((node) => {
                const Icon = node.definition.icon
                const isActive = node.definition.type === active.definition.type

                return (
                  <li
                    key={node.definition.type}
                    data-node-row
                    onMouseEnter={() => setActiveType(node.definition.type)}
                    className="group border-b border-border"
                  >
                    <div className="flex items-center gap-4 py-5">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-md transition-shadow duration-200",
                          node.definition.accent,
                          isActive &&
                            "shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                        )}
                        style={
                          isActive
                            ? { boxShadow: `0 0 24px -4px ${node.hex}` }
                            : undefined
                        }
                      >
                        <Icon className="size-4" />
                      </span>

                      <span className="w-28 shrink-0 text-sm font-medium text-foreground capitalize">
                        {node.definition.label}
                      </span>

                      <span className="flex-1 text-xs leading-relaxed text-muted-foreground">
                        {node.summary}
                      </span>

                      <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase md:block">
                        {node.outputTag}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            <span
              className="mb-4 block h-1 w-10 rounded-full"
              style={{ backgroundColor: active.hex }}
            />
            <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
              {active.definition.kind === "trigger" ? "Trigger" : "Action"}
            </p>
            <p className="mt-2 text-lg font-medium text-foreground capitalize">
              {active.definition.label}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {active.summary}
            </p>
            <dl className="mt-6 space-y-2 border-t border-border pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                  Outputs
                </dt>
                <dd className="font-mono text-[11px] text-foreground">
                  {active.outputTag}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                  Fields
                </dt>
                <dd className="font-mono text-[11px] text-foreground">
                  {active.definition.fields.length || "none"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

export { NodeIndex }
