"use client"

import * as React from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function getSnapshot(): boolean | null {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean | null {
  return null
}

// Null while the preference is still unknown, so callers can hold back motion
// setup on the server instead of guessing.
function useReducedMotion() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export { useReducedMotion }
