<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Adding a workflow node

Three edits, all under '/workflows/nodes/":
1. the impl file (e.g. 'open-url.ts') - the node's executor logic or run-workflow logic wherever the code relies,
2. register it in 'node-executors.ts' or 'run-workflow.ts' - the 'satisfies' contract makes a missing executor a compile error for action nodes,
3. add its manifest entry in 'settings.ts' - kind, label, icon, accent, its input 'fields', and the 'outputs' downstream nodes can reference.

The run task and the canvas step node are registry-driven - never touch them to add
a node.

# Database types

Derive database types from the Drizzle schema — never hand-write custom or partial
shapes for table rows. Export `typeof table.$inferSelect` (and `$inferInsert` when
needed) from `lib/schema.ts` and import it. When a consumer needs only some
columns, narrow with `Pick<Row, ...>` / `Omit<Row, ...>` rather than redeclaring a
literal type. Do not add an insert type where `db.insert(...).values()` already
enforces the shape.

# Apostrophes

Do not use apostrophes in any text you write — UI copy, comments, docs, or commit
messages. Rewrite the phrase instead of contracting it: "does not" rather than
"doesn't", "the organization for the user" rather than "the user's organization".
This keeps JSX free of unescaped-entity lint errors and keeps strings safe to pass
through shell and SQL quoting.

# React Flow

The installed package is `@xyflow/react` (React Flow v12). The older `reactflow`
package name is v11 and does not apply here.

Do not write React Flow code from memory — the v11 and v12 APIs differ, and much
training data still describes v11. Before using any React Flow API, component,
hook, or prop, fetch https://reactflow.dev/llms.txt and follow the page it points
to for that topic. Verify the local types under
`node_modules/@xyflow/react/dist/esm/` when the docs and the installed version
disagree; the installed version wins.

# Trigger.dev agent skills

This project has Trigger.dev agent skills installed in .agents/skills/. Before writing or changing Trigger.dev code (background tasks, scheduled tasks, realtime, or chat.agent AI agents), load the most relevant skill:
`trigger-authoring-chat-agent`, `trigger-authoring-tasks`,
`trigger-chat-agent-advanced`,
`trigger-cost-savings`,
`trigger-getting-started`, `trigger-realtime-and-frontend`.
<!-- TRIGGER.DEV SKILLS END-->

# Trigger.dev worker code

Tasks run in a plain Node worker outside Next, and the worker bundle is built
from the directories listed in the `dirs` option in `trigger.config.ts`. Four
rules follow from that, and `npm run check:trigger` enforces all four across the
whole worker module graph, including files a task reaches indirectly. The check
also runs automatically as `prebuild`.

1. A file that defines a task must live under a directory in `dirs`. A task
   outside those directories never registers, and triggering its id fails.
2. Nothing a task can reach at runtime may import `server-only`, `next/*`,
   `@clerk/nextjs`, or client-only React packages. Use `@/lib/db/client` rather
   than `@/lib/db` for database access from a task: the client module is the
   same Drizzle instance without the `server-only` guard.
3. Every package the worker imports must be declared in `package.json`. A
   package that only exists in `node_modules` disappears on the next install.
4. App code triggers a task through a helper that owns both the id and the
   payload type, such as `workflows/lib/trigger-run-workflow.ts`. Writing
   `tasks.trigger<typeof someTask>("some-id", ...)` inline lets the id and the
   type drift apart, which type checks fine and runs the wrong task. App code
   must never import a task module at runtime, only `import type`.
