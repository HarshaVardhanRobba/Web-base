"use client"

import Image from "next/image"

import { Reveal } from "@/components/marketing/reveal"

const logLines = [
  { label: "start · session opened", hex: "#3b82f6" },
  { label: "open-url · https://news.ycombinator.com", hex: "#10b981" },
  { label: "observe · 30 story links matched", hex: "#0ea5e9" },
  { label: "act · clicked the top story", hex: "#8b5cf6" },
  { label: "extract · title, points, author", hex: "#f59e0b" },
  { label: "screenshot · viewport captured", hex: "#f43f5e" },
  { label: "agent · goal met in 4 steps", hex: "#d946ef" },
  { label: "run finished in 18.4s", hex: "#10b981" },
]

function LiveRuns() {
  return (
    <section id="runs" className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[110rem] gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="flex flex-col justify-center gap-5">
          <h2 className="max-w-md text-2xl font-medium tracking-[-0.03em] text-foreground md:text-4xl">
            Watch the run as it happens
          </h2>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Every step streams its status, its output and its screenshots while
            the browser is still open. Failures stop at the node that broke,
            with the message it returned, so there is no guessing which step
            went wrong.
          </p>
          <p
            id="teams"
            className="max-w-md scroll-mt-24 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground"
          >
            Teams share one workspace. Cursors, node edits and run logs arrive
            live for everyone who has the workflow open, and each run keeps its
            output for the next person who looks.
          </p>
        </Reveal>

        <Reveal
          selector="[data-log-line]"
          y={8}
          stagger={0.04}
          className="rounded-lg border border-border bg-card p-4 md:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
              Run log
            </span>
            <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
              live
            </span>
          </div>

          <ul className="space-y-2">
            {logLines.map((line) => (
              <li
                key={line.label}
                data-log-line
                className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: line.hex }}
                />
                <span className="truncate">{line.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 overflow-hidden rounded-md border border-border">
            <Image
              src="/marketing/run-logs.png"
              alt="The run log panel with the output of a finished step"
              width={2530}
              height={710}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export { LiveRuns }
