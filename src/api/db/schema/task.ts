import { sql } from "drizzle-orm";
import { index, integer, snakeCase, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { users } from "./auth.ts";

export const tasks = snakeCase.table("tasks", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  done: integer({ mode: "boolean" }).notNull().default(false),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [index("tasks_userId_idx").on(table.userId)]);

export const SelectTaskSchema = createSelectSchema(tasks).extend({
  id: z.number().positive(),
  userId: z.number().positive(),
});

export const InsertTaskSchema = createInsertSchema(
  tasks,
  {
    name: (field) => field.min(1).max(500),
  },
).required({
  done: true,
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTaskSchema = InsertTaskSchema.partial();
