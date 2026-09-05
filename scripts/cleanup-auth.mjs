import { config } from "dotenv";
import { Pool } from "pg";
config({
  path: process.env.AUTH_ENV_FILE || ".env.development.local",
  quiet: true,
});
if (!process.env.CAREER_DATABASE_URL)
  throw Error("CAREER_DATABASE_URL is required");
const pool = new Pool({
  connectionString: process.env.CAREER_DATABASE_URL,
  max: 1,
});
try {
  // Bounded batches; active sessions, account credentials and current limits are untouched.
  const sessions = await pool.query(
    "DELETE FROM user_sessions WHERE token_hash IN (SELECT token_hash FROM user_sessions WHERE expires_at <= now() LIMIT 1000)",
  );
  const limits = await pool.query(
    "DELETE FROM auth_rate_limits WHERE key IN (SELECT key FROM auth_rate_limits WHERE expires_at <= now() LIMIT 1000)",
  );
  console.log(
    `Removed ${sessions.rowCount} expired sessions and ${limits.rowCount} expired rate-limit entries.`,
  );
} catch {
  console.error(
    "Account cleanup failed. Check database configuration without logging credentials.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
