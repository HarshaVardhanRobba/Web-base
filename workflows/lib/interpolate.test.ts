import { describe, expect, it } from "vitest"

import { interpolate } from "./interpolate"

describe("interpolate", () => {
  it("replaces a simple placeholder", () => {
    expect(interpolate("{{ open.url }}", { open: { url: "https://a.com" } })).toBe(
      "https://a.com"
    )
  })

  it("walks array indexes in a path", () => {
    expect(
      interpolate("{{ extract.items[0].name }}", {
        extract: { items: [{ name: "first" }] },
      })
    ).toBe("first")
  })

  it("resolves an unknown node id to an empty string", () => {
    expect(interpolate("{{ typo.url }}", { open: { url: "https://a.com" } })).toBe("")
  })

  it("resolves a path past the value it points at to an empty string", () => {
    expect(interpolate("{{ open.title.length }}", { open: { url: "https://a.com" } })).toBe(
      ""
    )
  })

  it("resolves an empty placeholder to an empty string", () => {
    expect(interpolate("{{}}", { open: { url: "https://a.com" } })).toBe("")
  })

  it("leaves text with no placeholder unchanged", () => {
    expect(interpolate("plain text", {})).toBe("plain text")
  })

  it("stringifies an object result as JSON", () => {
    expect(interpolate("{{ open }}", { open: { url: "https://a.com" } })).toBe(
      JSON.stringify({ url: "https://a.com" })
    )
  })

  it("does not re-interpolate placeholder syntax found inside a resolved value", () => {
    expect(
      interpolate("{{ extract.text }}", { extract: { text: "{{ open.url }}" } })
    ).toBe("{{ open.url }}")
  })

  it("resolves multiple placeholders in one field", () => {
    expect(
      interpolate("{{ a.x }} and {{ b.y }}", { a: { x: "1" }, b: { y: "2" } })
    ).toBe("1 and 2")
  })
})
