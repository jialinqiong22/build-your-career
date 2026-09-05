import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function authConfigured() {
  return (
    process.env.AUTH_ENABLED === "true" &&
    !!process.env.CAREER_DATABASE_URL &&
    Buffer.byteLength(process.env.AUTH_SECRET || "") >= 32
  );
}
export function getDb() {
  if (!authConfigured()) throw new Error("Auth is not configured");
  if (!database) {
    const pool = new Pool({
      connectionString: process.env.CAREER_DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", () =>
      console.error("Account database connection unavailable"),
    );
    if (process.env.VERCEL === "1") attachDatabasePool(pool);
    database = drizzle(pool, { schema });
  }
  return database;
}
