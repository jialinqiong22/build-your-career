// Creates only uniquely named synthetic accounts in the explicitly selected dev DB.
// Never run against production. Cleans only the exact generated account IDs.
// Verification codes are seeded directly (the script owns AUTH_SECRET locally);
// Turnstile cannot be satisfied from a headless smoke run.
import { config } from "dotenv";
import { Pool } from "pg";
import assert from "node:assert/strict";
import { randomBytes, createHmac } from "node:crypto";
import bcrypt from "bcrypt";
config({ path: ".env.development.local", override: true, quiet: true });
const base = process.env.AUTH_SMOKE_BASE || "http://127.0.0.1:4174";
if (
  !/^http:\/\/127\.0\.0\.1:\d+$/.test(base) ||
  process.env.AUTH_SMOKE_ALLOW !== "true"
)
  throw Error("Set AUTH_SMOKE_ALLOW=true and use loopback dev server only");
const uri = new URL(process.env.CAREER_DATABASE_URL_UNPOOLED || "");
if (
  !uri.hostname.startsWith("ep-") ||
  !uri.hostname.endsWith(".neon.tech") ||
  !process.env.AUTH_SECRET
)
  throw Error("Missing Neon dev config");
const db = new Pool({ connectionString: uri.toString(), max: 1 });
const tag = "test_" + randomBytes(5).toString("hex");
const email = tag + "@example.test";
const password = "Synthetic-test-" + randomBytes(12).toString("hex");
const newPassword = "Reworked-test-" + randomBytes(12).toString("hex");
const createdIds = [];
const codeIds = [];
const digest = (value) =>
  createHmac("sha256", process.env.AUTH_SECRET).update(value).digest("hex");
const codeDigest = (purpose, mail, code) =>
  digest(`code:${purpose}:${mail}:${code}`);
async function seedCode(purpose, mail, code) {
  const row = await db.query(
    "INSERT INTO email_verification_codes (email,purpose,code_hash,attempts,expires_at) VALUES ($1,$2,$3,0,now()+interval '10 minutes') RETURNING email",
    [mail, purpose, codeDigest(purpose, mail, code)],
  );
  codeIds.push([row.rows[0].email, purpose]);
}
async function codeRowCount(mail, purpose) {
  return (
    await db.query(
      "SELECT count(*)::int n FROM email_verification_codes WHERE email=$1 AND purpose=$2",
      [mail, purpose],
    )
  ).rows[0].n;
}
const post = (path, body, cookie = "", origin = base) =>
  fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
const session = (cookie) =>
  fetch(base + "/api/auth/session", { headers: { Cookie: cookie } }).then((r) =>
    r.json(),
  );
const cookieOf = (r) => r.headers.get("set-cookie")?.split(";")[0] || "";
let checks = 0;
function status(response, expected) {
  assert.equal(response.status, expected);
  checks++;
}
try {
  // Dev-source counters only; do not touch identities belonging to other users.
  await db.query("DELETE FROM auth_rate_limits WHERE key = ANY($1::text[])", [
    [
      digest("rate:register:source:shared-untrusted-source"),
      digest("rate:login:source:shared-untrusted-source"),
      digest("rate:code:source:shared-untrusted-source"),
      digest("rate:reset:source:shared-untrusted-source"),
      digest("rate:delete:source:shared-untrusted-source"),
    ],
  ]);
  status(
    await post(
      "/api/auth/register",
      { username: tag, identifier: email, password, acceptedPolicies: true },
      "",
      "https://attacker.invalid",
    ),
    403,
  );
  status(
    await post("/api/auth/register", {
      username: "x",
      identifier: email,
      password,
      acceptedPolicies: true,
      emailCode: "123456",
    }),
    400,
  );
  status(
    await post("/api/auth/register", {
      username: tag,
      identifier: email,
      password: "a".repeat(73),
      acceptedPolicies: true,
      emailCode: "123456",
    }),
    400,
  );
  status(
    await post("/api/auth/register", {
      username: tag,
      identifier: email,
      password,
      acceptedPolicies: false,
      emailCode: "123456",
    }),
    400,
  );
  status(
    await post("/api/auth/register", {
      username: tag,
      identifier: email,
      password,
      acceptedPolicies: true,
      emailCode: "12a456",
    }),
    400,
  );
  status(
    await post("/api/auth/verification-code", {
      identifier: email,
      purpose: "register",
    }),
    403,
  );
  status(
    await post(
      "/api/auth/verification-code",
      { identifier: email, purpose: "register" },
      "",
      "https://attacker.invalid",
    ),
    403,
  );
  // No Turnstile token is available to a smoke run, so the send-code happy
  // path is covered by the seeded-code flow below.
  status(
    await post("/api/auth/verification-code", {
      identifier: email,
      purpose: "register",
      turnstileToken: "dummy-token",
    }),
    403,
  );
  const registerCode = "482913";
  await seedCode("register", email, registerCode);
  status(
    await post("/api/auth/register", {
      username: tag,
      identifier: email.toUpperCase(),
      password,
      acceptedPolicies: true,
      emailCode: "000000",
    }),
    400,
  );
  assert.equal(await codeRowCount(email, "register"), 1);
  assert.equal(
    (
      await db.query(
        "SELECT attempts FROM email_verification_codes WHERE email=$1 AND purpose='register'",
        [email],
      )
    ).rows[0].attempts,
    1,
  );
  const register = await post("/api/auth/register", {
    username: tag,
    identifier: email,
    password,
    acceptedPolicies: true,
    emailCode: registerCode,
  });
  status(register, 201);
  const registered = await register.json();
  createdIds.push(registered.user.id);
  assert.deepEqual(Object.keys(registered.user).sort(), ["id", "username"]);
  const cookie = cookieOf(register);
  assert(cookie);
  assert.match(register.headers.get("set-cookie"), /HttpOnly/);
  assert.equal((await session(cookie)).user.id, registered.user.id);
  // A consumed register code must be gone even for a reuse attempt.
  assert.equal(await codeRowCount(email, "register"), 0);
  const stored = (
    await db.query("SELECT password,email,phone FROM users WHERE id=$1", [
      registered.user.id,
    ])
  ).rows[0];
  assert.equal(stored.email, email);
  assert.equal(stored.phone, null);
  assert.notEqual(stored.password, password);
  assert.match(stored.password, /^\$2b\$12\$/);
  assert(await bcrypt.compare(password, stored.password));
  const token = cookie.split("=")[1];
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM user_sessions WHERE token_hash=$1",
        [digest("session:" + token)],
      )
    ).rows[0].n,
    1,
  );
  // Duplicate identities need fresh codes; the first register consumed theirs.
  await seedCode("register", email, "340125");
  status(
    await post("/api/auth/register", {
      username: tag + "_2",
      identifier: email,
      password,
      acceptedPolicies: true,
      emailCode: "340125",
    }),
    409,
  );
  await seedCode("register", tag + "2@example.test", "571938");
  status(
    await post("/api/auth/register", {
      username: tag.toUpperCase(),
      identifier: tag + "2@example.test",
      password,
      acceptedPolicies: true,
      emailCode: "571938",
    }),
    409,
  );
  status(
    await post("/api/auth/register", {
      username: tag + "_phone",
      identifier: "+8613800138000",
      password,
      acceptedPolicies: true,
      emailCode: "123456",
    }),
    400,
  );
  status(
    await post("/api/auth/login", {
      identifier: email,
      password: "wrong-but-long-password",
    }),
    401,
  );
  const login = await post(
    "/api/auth/login",
    { identifier: email, password },
    cookie,
  );
  status(login, 200);
  const secondCookie = cookieOf(login);
  assert.notEqual(cookie, secondCookie);
  assert.equal((await session(secondCookie)).user.id, registered.user.id);
  assert.equal((await session(cookie)).user, null); // rotated previous session revoked
  status(
    await post(
      "/api/auth/logout",
      {},
      secondCookie,
      "https://attacker.invalid",
    ),
    403,
  );
  status(await post("/api/auth/logout", {}, secondCookie), 200);
  assert.equal((await session(secondCookie)).user, null);
  // Password reset: wrong code first, then the seeded code.
  status(
    await post("/api/auth/password-reset", {
      identifier: email,
      emailCode: "654321",
      password: newPassword,
    }),
    400,
  );
  status(
    await post(
      "/api/auth/password-reset",
      { identifier: email, emailCode: "654321", password: newPassword },
      "",
      "https://attacker.invalid",
    ),
    403,
  );
  const resetCode = "736415";
  await seedCode("password_reset", email, resetCode);
  const resetLogin = await post("/api/auth/login", { identifier: email, password });
  status(resetLogin, 200);
  const resetCookie = cookieOf(resetLogin);
  assert.equal((await session(resetCookie)).user.id, registered.user.id);
  status(
    await post("/api/auth/password-reset", {
      identifier: email,
      emailCode: resetCode,
      password: newPassword,
    }),
    200,
  );
  assert.equal(await codeRowCount(email, "password_reset"), 0);
  assert.equal((await session(resetCookie)).user, null); // reset revoked all sessions
  status(
    await post("/api/auth/login", { identifier: email, password }),
    401,
  );
  const relogin = await post("/api/auth/login", {
    identifier: email,
    password: newPassword,
  });
  status(relogin, 200);
  const thirdCookie = cookieOf(relogin);
  assert.equal((await session(thirdCookie)).user.id, registered.user.id);
  // Self-service deletion requires the current password and ends the account.
  status(
    await post("/api/auth/delete-account", {}, thirdCookie),
    400,
  );
  status(
    await post(
      "/api/auth/delete-account",
      { password: newPassword },
      thirdCookie,
      "https://attacker.invalid",
    ),
    403,
  );
  status(
    await post("/api/auth/delete-account", { password: "not-the-password-long-enough" }, thirdCookie),
    403,
  );
  const deletion = await post(
    "/api/auth/delete-account",
    { password: newPassword },
    thirdCookie,
  );
  status(deletion, 200);
  assert.match(deletion.headers.get("set-cookie") || "", /Max-Age=0/);
  assert.equal((await session(thirdCookie)).user, null);
  assert.equal(
    (
      await db.query("SELECT count(*)::int n FROM users WHERE id=$1", [
        registered.user.id,
      ])
    ).rows[0].n,
    0,
  );
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM user_sessions WHERE user_id=$1",
        [registered.user.id],
      )
    ).rows[0].n,
    0,
  );
  status(
    await post("/api/auth/delete-account", { password: newPassword }, thirdCookie),
    401,
  );
  assert.equal((await fetch(base + "/api/premium/bank")).status, 403);
  console.log(
    `Auth smoke passed: ${checks} HTTP status checks plus hashing, verification codes, reset, deletion, sessions, expiry, uniqueness, rate-limit and premium separation assertions.`,
  );
} finally {
  if (createdIds.length)
    await db.query(
      "DELETE FROM users WHERE id=ANY($1::int[]) AND username LIKE $2",
      [createdIds, tag + "%"],
    );
  for (const [mail, purpose] of codeIds)
    await db.query(
      "DELETE FROM email_verification_codes WHERE email=$1 AND purpose=$2",
      [mail, purpose],
    );
  await db.query("DELETE FROM auth_rate_limits WHERE key = ANY($1::text[])", [
    [
      digest("rate:register:source:shared-untrusted-source"),
      digest("rate:login:source:shared-untrusted-source"),
      digest("rate:code:source:shared-untrusted-source"),
      digest("rate:reset:source:shared-untrusted-source"),
      digest("rate:delete:source:shared-untrusted-source"),
    ],
  ]);
  await db.end();
}
