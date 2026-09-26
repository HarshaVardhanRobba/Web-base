"use client"

import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { useReducedMotion } from "@/components/marketing/use-reduced-motion"

type RevealProps = {
  children: React.ReactNode
  className?: string
  selector?: string
  stagger?: number
  y?: number
}

// Fades a section, or the elements matching selector inside it, up into place on
// entry. Under reduced motion the content is simply left where it is.
function Reveal({
  children,
  className,
  selector,
  stagger = 0.06,
  y = 32,
}: RevealProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  React.useEffect(() => {
    if (reducedMotion !== false) return
    const root = rootRef.current
    if (!root) return

    gsap.registerPlugin(ScrollTrigger)

    const targets = selector
      ? Array.from(root.querySelectorAll(selector))
      : [root]
    if (!targets.length) return

    const tween = gsap.from(targets, {
      autoAlpha: 0,
      y,
      duration: 0.8,
      ease: "power4.out",
      stagger,
      scrollTrigger: { trigger: root, start: "top 82%" },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reducedMotion, selector, stagger, y])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}

export { Reveal }
