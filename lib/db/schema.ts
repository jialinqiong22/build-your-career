import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  timestamp,
  text,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 60 }).notNull(),
    email: varchar("email", { length: 254 }),
    phone: varchar("phone", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_username_unique").on(sql`lower(${table.username})`),
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    check(
      "users_one_identifier",
      sql`(${table.email} IS NOT NULL)::int + (${table.phone} IS NOT NULL)::int = 1`,
    ),
    check(
      "users_bcrypt_only",
      sql`${table.password} ~ '^[$]2[aby][$]12[$][./A-Za-z0-9]{53}$'`,
    ),
    check(
      "users_email_normalized",
      sql`${table.email} IS NULL OR ${table.email} = lower(${table.email})`,
    ),
  ],
);

export const sessions = pgTable(
  "user_sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("user_sessions_expiry_idx").on(table.expiresAt),
    index("user_sessions_user_idx").on(table.userId),
  ],
);

export const authLimits = pgTable(
  "auth_rate_limits",
  {
    key: text("key").primaryKey(),
    hits: integer("hits").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("auth_rate_limits_expiry_idx").on(table.expiresAt)],
);
