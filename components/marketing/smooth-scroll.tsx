"use client"

import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

import { useReducedMotion } from "@/components/marketing/use-reduced-motion"

// Lenis is the only smooth-scroll engine on the marketing pages, driven by the
// GSAP ticker so ScrollTrigger and Lenis never fight over the scroll position.
function SmoothScroll() {
  const reducedMotion = useReducedMotion()

  React.useEffect(() => {
    if (reducedMotion !== false) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    lenis.on("scroll", ScrollTrigger.update)

    function tick(time: number) {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [reducedMotion])

  return null
}

export { SmoothScroll }
