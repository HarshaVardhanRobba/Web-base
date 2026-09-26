import type { Metadata } from "next"

import { CanvasPreview } from "@/components/marketing/canvas-preview"
import { ClosingCta } from "@/components/marketing/closing-cta"
import { Hero } from "@/components/marketing/hero"
import { LiveRuns } from "@/components/marketing/live-runs"
import { NodeIndex } from "@/components/marketing/node-index"

export const metadata: Metadata = {
  title: "Automate the web, one node at a time",
  description:
    "Drag nodes onto a canvas, describe each step in plain language, and watch an agent run it in a real browser.",
}

export default function WelcomePage() {
  return (
    <main>
      <Hero />
      <CanvasPreview />
      <NodeIndex />
      <LiveRuns />
      <ClosingCta />
    </main>
  )
}
