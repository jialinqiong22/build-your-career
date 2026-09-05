import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
// Choose an environment intentionally; do not silently reuse a global DATABASE_URL.
config({
  path: process.env.AUTH_ENV_FILE || ".env.development.local",
  override: false,
  quiet: true,
});
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.CAREER_DATABASE_URL_UNPOOLED || "" },
});
