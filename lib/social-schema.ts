import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./db/schema";
import type { SocialData } from "./social-validation";
export const socialInvites = pgTable(
  "social_invites",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    ownerHash: varchar("owner_hash", { length: 64 }).notNull(),
    participantHash: varchar("participant_hash", { length: 64 }),
    ownerUserId: integer("owner_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    kind: text("kind").$type<"compare" | "feedback">().notNull(),
    status: text("status").notNull(),
    data: jsonb("data").$type<SocialData>().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("social_invites_expiry_idx").on(t.expiresAt)],
);
