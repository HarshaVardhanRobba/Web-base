<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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