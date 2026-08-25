// A placeholder written into a node field, such as {{ openPage.title }} or
// {{ extractItems.items[0].name }}. The first path segment is the id of an
// earlier node, and the rest walks into whatever that node returned.
const placeholder = /\{\{([^{}]*)\}\}/g

// Splits a path expression into its segments, treating dots and bracket indexes
// the same way: "items[0].name" becomes ["items", "0", "name"]. Array indexes
// arrive as strings, which is what a plain property read on an array wants.
const segments = /[^.[\]]+/g

// Walks a dotted or bracketed path from a root value. Returns undefined as soon
// as the path leaves the value behind, so a missing node id and a missing field
// on a present node both land in the same place.
function getByPath(root: unknown, path: string): unknown {
  const parts = path.match(segments)

  // An empty placeholder points at nothing rather than at the whole collection
  // of outputs, so {{}} resolves to an empty string like any other dead path.
  if (!parts) return undefined

  return parts.reduce<unknown>((value, segment) => {
    if (value === null || value === undefined) return undefined

    return (value as Record<string, unknown>)[segment]
  }, root)
}

// What a resolved value looks like once it is spliced back into the field text.
// Nothing resolved becomes an empty string rather than the literal "undefined",
// and an object or array becomes JSON so the whole shape survives the trip.
function stringify(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") return JSON.stringify(value)

  return String(value)
}

// Replaces every {{ path }} in one field with the value it points at, reading
// from the outputs every node in this run has produced so far, keyed by node id.
// Pure and free of any browser or worker imports, so it is safe to call from the
// task, from a server action, or from the inspector for a live preview.
export function interpolate(
  text: string,
  outputs: Record<string, unknown>
): string {
  return text.replace(placeholder, (_match, path: string) =>
    stringify(getByPath(outputs, path.trim()))
  )
}
