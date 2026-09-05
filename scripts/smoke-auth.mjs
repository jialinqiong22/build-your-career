// Creates only uniquely named synthetic accounts in the explicitly selected dev DB.
// Never run against production. Cleans only the exact generated account IDs.
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
const email = tag + "@example.test",
  phone = "+1202555" + String(Math.floor(Math.random() * 100)).padStart(4, "0");
const password = "Synthetic-test-" + randomBytes(12).toString("hex");
const createdIds = [];
const digest = (value) =>
  createHmac("sha256", process.env.AUTH_SECRET).update(value).digest("hex");
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
    ],
  ]);
  status(
    await post(
      "/api/auth/register",
      { username: tag, identifier: email, password },
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
    }),
    400,
  );
  status(
    await post("/api/auth/register", {
      username: tag,
      identifier: email,
      password: "a".repeat(73),
    }),
    400,
  );
  const register = await post("/api/auth/register", {
    username: tag,
    identifier: email.toUpperCase(),
    password,
  });
  status(register, 201);
  const registered = await register.json();
  createdIds.push(registered.user.id);
  assert.deepEqual(Object.keys(registered.user).sort(), ["id", "username"]);
  const cookie = cookieOf(register);
  assert(cookie);
  assert.match(register.headers.get("set-cookie"), /HttpOnly/);
  assert.equal((await session(cookie)).user.id, registered.user.id);
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
  status(
    await post("/api/auth/register", {
      username: tag + "_2",
      identifier: email,
      password,
    }),
    409,
  );
  status(
    await post("/api/auth/register", {
      username: tag.toUpperCase(),
      identifier: tag + "2@example.test",
      password,
    }),
    409,
  );
  const phoneRegister = await post("/api/auth/register", {
    username: tag + "_p",
    identifier: phone,
    password,
  });
  status(phoneRegister, 201);
  const phoneUser = (await phoneRegister.json()).user;
  createdIds.push(phoneUser.id);
  status(
    await post("/api/auth/register", {
      username: tag + "_p2",
      identifier: phone,
      password,
    }),
    409,
  );
  status(
    await post("/api/auth/login", {
      identifier: phone,
      password: "wrong-but-long-password",
    }),
    401,
  );
  const login = await post(
    "/api/auth/login",
    { identifier: phone, password },
    cookie,
  );
  status(login, 200);
  const secondCookie = cookieOf(login);
  assert.notEqual(cookie, secondCookie);
  assert.equal((await session(secondCookie)).user.id, phoneUser.id);
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
  const emailLogin = await post("/api/auth/login", {
    identifier: email,
    password,
  });
  status(emailLogin, 200);
  const thirdCookie = cookieOf(emailLogin);
  await db.query(
    "UPDATE user_sessions SET expires_at=now()-interval '1 second' WHERE user_id=$1",
    [registered.user.id],
  );
  assert.equal((await session(thirdCookie)).user, null);
  assert.equal((await session("career_session=" + "a".repeat(64))).user, null);
  const missing = tag + "missing@example.test";
  for (let i = 0; i < 10; i++)
    status(
      await post("/api/auth/login", { identifier: missing, password }),
      401,
    );
  const limited = await post("/api/auth/login", {
    identifier: missing,
    password,
  });
  status(limited, 429);
  assert(Number(limited.headers.get("retry-after")) > 0);
  const limitKey = digest("rate:login:identity:email:" + missing);
  await db.query(
    "UPDATE auth_rate_limits SET expires_at=now()-interval '1 second' WHERE key=$1",
    [limitKey],
  );
  status(await post("/api/auth/login", { identifier: missing, password }), 401);
  const reset = (
    await db.query(
      "SELECT hits,expires_at FROM auth_rate_limits WHERE key=$1",
      [limitKey],
    )
  ).rows[0];
  assert.equal(reset.hits, 1);
  assert(reset.expires_at.getTime() > Date.now());
  assert.equal((await fetch(base + "/api/premium/bank")).status, 403);
  console.log(
    `Auth smoke passed: ${checks} HTTP status checks plus hashing, sessions, expiry, uniqueness, rate-limit and premium separation assertions.`,
  );
} finally {
  if (createdIds.length)
    await db.query(
      "DELETE FROM users WHERE id=ANY($1::int[]) AND username LIKE $2",
      [createdIds, tag + "%"],
    );
  await db.query("DELETE FROM auth_rate_limits WHERE key = ANY($1::text[])", [
    [
      digest("rate:register:source:shared-untrusted-source"),
      digest("rate:login:source:shared-untrusted-source"),
    ],
  ]);
  await db.end();
}
