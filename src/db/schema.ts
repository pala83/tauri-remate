import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Example table to validate the end-to-end flow; replace with the real model.
export const remates = sqliteTable("remates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titulo: text("titulo").notNull(),
  fecha: integer("fecha", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Remate = typeof remates.$inferSelect;
export type NewRemate = typeof remates.$inferInsert;
