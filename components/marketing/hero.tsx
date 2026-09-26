"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MenuIcon, XIcon } from "lucide-react"

import { marketingNodes } from "@/components/marketing/nodes"
import { useReducedMotion } from "@/components/marketing/use-reduced-motion"
import { cn } from "@/lib/utils"

const HeroSculpture = dynamic(
  () =>
    import("@/components/marketing/hero-sculpture").then(
      (module) => module.HeroSculpture
    ),
  { ssr: false }
)

const navItems = [
  { label: "Workflows", href: "#canvas" },
  { label: "Nodes", href: "#nodes" },
  { label: "Live runs", href: "#runs" },
  { label: "Teams", href: "#teams" },
  { label: "Log in", href: "/sign-in" },
]

const headlineLines = ["Automate the web,", "one node at a time."]

function Hero() {
  const reducedMotion = useReducedMotion()
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const canvasWrapRef = React.useRef<HTMLDivElement>(null)
  const headlineRef = React.useRef<HTMLHeadingElement>(null)
  const asideRef = React.useRef<HTMLDivElement>(null)
  const navRef = React.useRef<HTMLElement>(null)
  const ringRef = React.useRef<HTMLDivElement>(null)

  const fractureRef = React.useRef(0.35)
  const pointerRef = React.useRef({ x: 0, y: 0, strength: 0 })

  const [webglFailed, setWebglFailed] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  const onContextFailure = React.useCallback(() => setWebglFailed(true), [])

  React.useEffect(() => {
    if (reducedMotion !== false) return

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      const lines = headlineRef.current?.querySelectorAll("[data-line-inner]")

      const intro = gsap.timeline({
        defaults: { ease: "power4.out" },
      })

      intro.from(panelRef.current, { autoAlpha: 0, duration: 0.4 })
      intro.from(canvasWrapRef.current, { autoAlpha: 0, duration: 0.9 }, 0.1)
      if (lines?.length) {
        intro.from(lines, { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.15)
      }
      intro.from(
        [navRef.current, asideRef.current],
        { autoAlpha: 0, duration: 0.7 },
        0.6
      )

      const mobile = window.matchMedia("(max-width: 767px)").matches
      const state = { fracture: 0.35 }

      gsap.to(state, {
        fracture: 1,
        ease: "none",
        onUpdate: () => {
          fractureRef.current = state.fracture
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: mobile ? "+=60%" : "+=100%",
          scrub: 0.6,
          pin: panelRef.current,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })

      gsap.to([headlineRef.current, asideRef.current], {
        y: -40,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: mobile ? "+=60%" : "+=100%",
          scrub: 0.6,
        },
      })
    }, sectionRef)

    return () => context.revert()
  }, [reducedMotion])

  React.useEffect(() => {
    const panel = panelRef.current
    const ring = ringRef.current
    if (!panel || !ring) return
    if (reducedMotion !== false) return
    if (!window.matchMedia("(pointer: fine)").matches) return

    let frame = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let shown = false

    function onMove(event: PointerEvent) {
      const rect = panel!.getBoundingClientRect()
      target.x = event.clientX
      target.y = event.clientY
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        strength: 1,
      }
      if (!shown) {
        shown = true
        ring!.style.opacity = "1"
      }
    }

    function onLeave() {
      pointerRef.current = { ...pointerRef.current, strength: 0 }
      shown = false
      ring!.style.opacity = "0"
    }

    function loop() {
      frame = requestAnimationFrame(loop)
      current.x += (target.x - current.x) * 0.15
      current.y += (target.y - current.y) * 0.15
      ring!.style.transform = `translate3d(${current.x - 14}px, ${current.y - 14}px, 0)`
    }

    panel.addEventListener("pointermove", onMove)
    panel.addEventListener("pointerleave", onLeave)
    window.addEventListener("blur", onLeave)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      panel.removeEventListener("pointermove", onMove)
      panel.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("blur", onLeave)
    }
  }, [reducedMotion])

  return (
    <div ref={sectionRef} className="relative">
      <div
        ref={panelRef}
        className="relative isolate m-4 h-[calc(100svh-2rem)] overflow-hidden rounded-lg border border-border bg-card shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
      >
        <div
          ref={canvasWrapRef}
          className="pointer-events-none absolute inset-0 z-0 md:left-[18%]"
        >
          {reducedMotion !== null && !webglFailed ? (
            <HeroSculpture
              fractureRef={fractureRef}
              pointerRef={pointerRef}
              reducedMotion={reducedMotion}
              onContextFailure={onContextFailure}
            />
          ) : (
            <StaticSculpture />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_35%,rgba(0,0,0,0.85)_100%)]" />

        <nav
          ref={navRef}
          aria-label="Primary"
          className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 p-4 md:p-8"
        >
          <Link
            href="/welcome"
            className="flex items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span
              aria-hidden
              className="grid size-6 place-items-center rounded-sm border border-border bg-foreground/90"
            >
              <span className="size-2 rounded-[1px] bg-background" />
            </span>
            <span className="font-mono text-[11px] font-medium tracking-[0.06em] uppercase">
              Workflows
            </span>
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group relative font-mono text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground px-4 py-2 font-mono text-[11px] font-medium tracking-[0.06em] text-background uppercase transition-all hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:translate-y-px"
            >
              Start building
            </Link>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="hero-mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-9 place-items-center rounded-sm border border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden"
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              {menuOpen ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </button>
          </div>
        </nav>

        <div
          id="hero-mobile-nav"
          hidden={!menuOpen}
          className="absolute inset-x-4 top-20 z-30 rounded-md border border-border bg-card/95 p-4 backdrop-blur-sm md:hidden"
        >
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-1 items-end gap-8 p-4 pb-8 md:grid-cols-12 md:gap-6 md:p-8">
          <h1
            ref={headlineRef}
            className="col-span-1 text-[clamp(3rem,12vw,9rem)] leading-[0.92] font-medium tracking-[-0.045em] text-foreground md:col-span-7 md:text-[clamp(3.5rem,7vw,9rem)] lg:text-[clamp(3.5rem,9vw,9rem)]"
          >
            {headlineLines.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-line-inner className="block">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div
            ref={asideRef}
            className="col-span-1 flex flex-col gap-3 md:col-span-4 md:col-start-9"
          >
            <span className="w-fit rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              See it run
            </span>
            <p className="max-w-sm bg-gradient-to-t from-background/80 to-transparent text-xs leading-relaxed text-muted-foreground md:bg-none">
              Drag nodes onto a canvas, describe each step in plain language,
              and watch an agent run it in a real browser. Every run is logged,
              replayable and shared with your team live.
            </p>
          </div>
        </div>

        <div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40 size-7 rounded-full border border-foreground/40 opacity-0 transition-opacity duration-200 max-md:hidden"
        />
      </div>
    </div>
  )
}

// Shown when WebGL is unavailable: the same node vocabulary as the scene, built
// from interface chips so the first viewport is never empty.
function StaticSculpture() {
  const offsets = [
    "top-[18%] left-[42%]",
    "top-[30%] left-[62%]",
    "top-[46%] left-[48%]",
    "top-[58%] left-[68%]",
    "top-[34%] left-[80%]",
    "top-[68%] left-[52%]",
    "top-[22%] left-[70%]",
  ]

  return (
    <div aria-hidden className="relative size-full">
      {marketingNodes.map((node, index) => {
        const Icon = node.definition.icon
        return (
          <span
            key={node.definition.type}
            className={cn(
              "absolute grid size-10 place-items-center rounded-md border border-border",
              node.definition.accent,
              offsets[index]
            )}
          >
            <Icon className="size-4" />
          </span>
        )
      })}
    </div>
  )
}

export { Hero }
