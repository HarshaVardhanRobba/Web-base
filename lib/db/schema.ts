import {jsonb ,pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Example table. Replace with the real schema, then run `npm run db:generate`
// followed by `npm run db:migrate`.
export const workflows = pgTable("workflows", {
  id: uuid().primaryKey().defaultRandom(),
  orgId: text("org_id").notNull(),
  name: text().notNull(),
  graph: jsonb("graph"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type workflow = typeof workflows.$inferSelect
