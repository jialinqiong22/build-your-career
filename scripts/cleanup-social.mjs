import "dotenv/config";
import pg from "pg";
if (!process.env.CAREER_DATABASE_URL) throw new Error("CAREER_DATABASE_URL is required");
const pool=new pg.Pool({connectionString:process.env.CAREER_DATABASE_URL,max:1});
try {
  // Expired records (including snapshots, scores and feedback) are physically purged.
  const result=await pool.query("DELETE FROM social_invites WHERE expires_at <= now()");
  console.log(`Purged ${result.rowCount} expired social invitations.`);
} finally {await pool.end();}
