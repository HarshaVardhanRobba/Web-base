import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Example table. Replace with the real schema, then run `npm run db:generate`
// followed by `npm run db:migrate`.
export const examples = pgTable("examples", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
