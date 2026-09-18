import {
  pgTable,
  integer,
  varchar,
  jsonb,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./schema";
export const assessmentProgress = pgTable(
  "assessment_progress",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 16 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    revision: uuid("revision").notNull().defaultRandom(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.kind] })],
);
