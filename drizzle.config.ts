import { config } from "dotenv"

config({ path: ".env.local" })

import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED is not set in .env.local")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Direct (non-pooled) connection: migrations need session state, which
  // PgBouncer's transaction mode does not preserve.
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
  casing: "snake_case",
})
