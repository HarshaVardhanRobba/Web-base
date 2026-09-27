// Static gate for the Trigger.dev worker build. Every failure here is a bug
// that otherwise only shows up as a crashed run, or as a task that never
// registers and so never runs at all.
//
// Run by "npm run check:trigger", and automatically by "npm run build" and
// "npm run lint".

import { readFileSync, readdirSync, statSync } from "node:fs"
import { builtinModules } from "node:module"
import { dirname, join, relative, resolve } from "node:path"

const root = process.cwd()
const problems = []

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs"]
const SKIP_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".trigger",
  ".claude",
  ".agents",
  "node_modules",
  "drizzle",
  "public",
])

// Modules that either throw or drag a browser bundle into the worker. The
// worker runs plain Node outside Next, so none of these belong in a module a
// task can reach at runtime.
const FORBIDDEN_IN_WORKER = [
  { match: (id) => id === "server-only", why: "it throws outside Next" },
  {
    match: (id) => id.startsWith("next/"),
    why: "Next runtime APIs need a request",
  },
  {
    match: (id) => id.startsWith("@clerk/nextjs"),
    why: "Clerk server helpers need a request",
  },
  {
    match: (id) => id === "react" || id === "react-dom",
    why: "the worker renders nothing",
  },
  { match: (id) => id === "@xyflow/react", why: "it is canvas-only code" },
  { match: (id) => id === "lucide-react", why: "it is icon components" },
  {
    match: (id) => id.startsWith("@liveblocks/react"),
    why: "it is client-only code",
  },
]

function walk(directory) {
  const found = []

  for (const entry of readdirSync(directory)) {
    if (SKIP_DIRECTORIES.has(entry)) continue

    const full = join(directory, entry)

    // A symlink whose target was not copied into the build stats as missing, so
    // skip what cannot be read rather than failing the whole check.
    const stats = statSync(full, { throwIfNoEntry: false })
    if (!stats) continue

    if (stats.isDirectory()) {
      found.push(...walk(full))
      continue
    }

    if (SOURCE_EXTENSIONS.some((extension) => entry.endsWith(extension))) {
      found.push(full)
    }
  }

  return found
}

function read(file) {
  return readFileSync(file, "utf8")
}

function short(file) {
  return relative(root, file).split("\\").join("/")
}

// One entry per import in a file. Type-only imports are erased before the
// bundle is built, so they never pull their target into the worker, but the
// package still has to be installed for the types to resolve.
function importsOf(source) {
  const found = []
  const patterns = [
    { regex: /\bimport\s+type\s[^"';]*?from\s*["']([^"']+)["']/g, typeOnly: true },
    { regex: /\bexport\s+type\s[^"';]*?from\s*["']([^"']+)["']/g, typeOnly: true },
    { regex: /\bimport\s+(?!type\s)[^"';]*?from\s*["']([^"']+)["']/g, typeOnly: false },
    { regex: /\bexport\s+(?!type\s)[^"';]*?from\s*["']([^"']+)["']/g, typeOnly: false },
    { regex: /\bimport\s*["']([^"']+)["']/g, typeOnly: false },
    { regex: /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, typeOnly: false },
    { regex: /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g, typeOnly: false },
  ]

  for (const { regex, typeOnly } of patterns) {
    for (const match of source.matchAll(regex)) {
      found.push({ id: match[1], typeOnly })
    }
  }

  return found
}

function isRelative(id) {
  return id.startsWith(".")
}

function isAliased(id) {
  return id.startsWith("@/")
}

// Mirrors the "@/*": ["./*"] path in tsconfig.json plus the extension guessing
// every bundler does, so the walk below sees what esbuild sees.
function resolveLocal(id, fromFile) {
  const base = isAliased(id)
    ? resolve(root, id.slice(2))
    : resolve(dirname(fromFile), id)

  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => base + extension),
    ...SOURCE_EXTENSIONS.map((extension) => join(base, "index" + extension)),
  ]

  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate
    } catch {
      // Keep trying the other extensions.
    }
  }

  return undefined
}

function packageNameOf(id) {
  const parts = id.split("/")
  return id.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

const packageJson = JSON.parse(read(join(root, "package.json")))
const declaredPackages = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
])

const triggerConfig = read(join(root, "trigger.config.ts"))
const dirsMatch = triggerConfig.match(/dirs\s*:\s*\[([^\]]*)\]/)

if (!dirsMatch) {
  console.error("check-trigger: no dirs option found in trigger.config.ts")
  process.exit(1)
}

const taskDirectories = [...dirsMatch[1].matchAll(/["']([^"']+)["']/g)].map(
  (match) => resolve(root, match[1])
)

const sourceFiles = walk(root)

// Every file that defines a task, mapped to the ids it defines.
const taskFiles = new Map()

for (const file of sourceFiles) {
  const source = read(file)
  if (!/\b(?:task|schemaTask)\s*\(\s*\{/.test(source)) continue

  const ids = [...source.matchAll(/\bid\s*:\s*["']([^"']+)["']/g)].map(
    (match) => match[1]
  )

  if (ids.length > 0) taskFiles.set(file, ids)
}

const knownTaskIds = new Set([...taskFiles.values()].flat())

// Check 1: every task file sits in a directory the config scans.
for (const file of taskFiles.keys()) {
  const full = resolve(file)
  const scanned = taskDirectories.some(
    (directory) =>
      full.startsWith(directory + "\\") || full.startsWith(directory + "/")
  )

  if (!scanned) {
    problems.push(
      short(file) +
        " defines a task but sits outside the dirs option in trigger.config.ts, " +
        "so it never registers and triggering it fails"
    )
  }
}

// Check 2: the worker module graph stays worker safe.
const workerGraph = new Set()
const queue = [...taskFiles.keys()]

while (queue.length > 0) {
  const file = queue.pop()
  if (workerGraph.has(file)) continue
  workerGraph.add(file)

  for (const { id, typeOnly } of importsOf(read(file))) {
    if (typeOnly) continue

    if (isRelative(id) || isAliased(id)) {
      const target = resolveLocal(id, file)
      if (target) queue.push(target)
      continue
    }

    const forbidden = FORBIDDEN_IN_WORKER.find((rule) => rule.match(id))

    if (forbidden) {
      problems.push(
        short(file) +
          " imports " +
          id +
          ", which a task must never reach: " +
          forbidden.why
      )
    }
  }
}

// Check 3: every package the worker imports is declared in package.json.
for (const file of workerGraph) {
  for (const { id } of importsOf(read(file))) {
    if (isRelative(id) || isAliased(id) || id.startsWith("node:")) continue
    if (builtinModules.includes(id)) continue

    const name = packageNameOf(id)

    if (!declaredPackages.has(name)) {
      problems.push(
        short(file) +
          " imports " +
          name +
          ", which is missing from package.json, so the next install removes it " +
          "and the worker build breaks"
      )
    }
  }
}

// Check 4: app code only triggers ids that a task actually defines.
for (const file of sourceFiles) {
  if (workerGraph.has(file)) continue

  const source = read(file)
  const triggerCalls =
    /\b(?:tasks\.)?(?:trigger|triggerAndWait|batchTrigger|batchTriggerAndWait)\s*(?:<[^>]*>)?\s*\(\s*["']([^"']+)["']/g

  for (const match of source.matchAll(triggerCalls)) {
    if (!knownTaskIds.has(match[1])) {
      problems.push(
        short(file) +
          " triggers the id " +
          match[1] +
          ", which no task in this project defines"
      )
    }
  }
}

// Check 5: app code never imports a task module at runtime, which would bundle
// the task into the Next build.
for (const file of sourceFiles) {
  if (workerGraph.has(file)) continue

  for (const { id, typeOnly } of importsOf(read(file))) {
    if (typeOnly) continue
    if (!isRelative(id) && !isAliased(id)) continue

    const target = resolveLocal(id, file)

    if (target && taskFiles.has(target)) {
      problems.push(
        short(file) +
          " imports " +
          short(target) +
          " at runtime, which bundles the task into the app. Use an import type " +
          "plus tasks.trigger with the id instead"
      )
    }
  }
}

if (problems.length > 0) {
  console.error("check-trigger found " + problems.length + " problem(s):\n")
  for (const problem of problems) console.error("  - " + problem)
  console.error("")
  process.exit(1)
}

console.log(
  "check-trigger: " +
    taskFiles.size +
    " task file(s), " +
    workerGraph.size +
    " module(s) in the worker graph, all clean"
)
