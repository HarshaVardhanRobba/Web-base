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
