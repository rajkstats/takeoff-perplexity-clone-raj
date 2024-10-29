import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const sourcesTable = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  summary: text("summary").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSource = typeof sourcesTable.$inferInsert
export type SelectSource = typeof sourcesTable.$inferSelect
