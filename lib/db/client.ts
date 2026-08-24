import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Pooled connection over HTTP: one round trip per query, no pool to keep alive
// across serverless invocations.
const sql = neon(process.env.DATABASE_URL)

// No "server-only" here on purpose. The Trigger.dev worker runs outside Next,
// where that import throws, and it needs the same client. The guard lives on
// lib/db instead, which is what Next code imports.
export const db = drizzle(sql, { schema, casing: "snake_case" })
