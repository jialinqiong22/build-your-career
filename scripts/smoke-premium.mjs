// Run only against a local server using the same test secret; never production.
import assert from "node:assert/strict";
import { issueAccessCode } from "../lib/premium-access.ts";
import { blank } from "../lib/positioning.ts";
import { hollandQuestions } from "../lib/instruments.ts";
import { valueQuestions, valueNames } from "../lib/values.ts";
const origin = process.env.SMOKE_ORIGIN || "http://127.0.0.1:4174";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
const request = (path, init = {}) => fetch(origin + path, init);
assert.equal((await request("/api/premium/bank")).status, 403);
assert.equal(
  (
    await request("/api/premium/report", {
      method: "POST",
      headers: { origin },
    })
  ).status,
  403,
);
const authCookie = process.env.SMOKE_AUTH_COOKIE;
const userId = Number(process.env.SMOKE_USER_ID);
if (!authCookie || !Number.isSafeInteger(userId) || userId < 1) {
  console.log("PASS anonymous denial. Authenticated integration SKIPPED: set local test SMOKE_AUTH_COOKIE and SMOKE_USER_ID.");
  process.exit(0);
}
const code = issueAccessCode(
  "LOCAL_SMOKE",
  Math.floor(Date.now() / 1000) + 3600,
  Math.floor(Date.now() / 1000),
  userId,
  "guided",
);
const post = (body, extra = {}) => ({
  method: "POST",
  headers: { origin, "Content-Type": "application/json", cookie: authCookie, ...extra },
  body: JSON.stringify(body),
});
assert.equal(
  (
    await request(
      "/api/premium/access",
      post({ code }, { origin: "https://other.test" }),
    )
  ).status,
  403,
);
assert.equal(
  (await request("/api/premium/access", post({ code: code + "x" }))).status,
  401,
);
const redeemed = await request("/api/premium/access", post({ code }));
assert.equal(redeemed.status, 200);
const cookie = authCookie + "; " + redeemed.headers.get("set-cookie").split(";")[0];
assert.match(redeemed.headers.get("set-cookie"), /HttpOnly/i);
const access = await (
  await request("/api/premium/access", { headers: { cookie } })
).json();
assert.equal(access.active, true);
const bank = await (
  await request("/api/premium/bank", { headers: { cookie } })
).json();
assert.equal(bank.bigFive.length, 120);
const p = blank();
p.priorities = valueNames.slice(0, 3);
p.evidence = p.evidence.map((e) => ({ ...e, status: "none" }));
p.enneagramChoice = "skip";
for (const q of [...valueQuestions, ...hollandQuestions, ...bank.bigFive])
  p.answers[q.id] = 3;
assert.equal(
  (await request("/api/premium/report", post({}, { cookie }))).status,
  400,
);
const response = await request("/api/premium/report", post(p, { cookie }));
assert.equal(response.status, 200, await response.clone().text());
assert.ok((await response.json()).report);
const skipped = await (
  await request("/api/premium/report", post(p, { cookie }))
).json();
p.enneagramChoice = "take";
for (const q of bank.enneagram) p.enneagramAnswers[q.id] = 5;
const withOptional = await (
  await request("/api/premium/report", post(p, { cookie }))
).json();
assert.deepEqual(
  withOptional.report,
  skipped.report,
  "Optional motive answers must not affect core report",
);
assert.equal(
  (
    await request(
      "/api/premium/report",
      post(p, { cookie, origin: "https://evil.test" }),
    )
  ).status,
  403,
);
assert.equal(
  (
    await request("/api/premium/access", {
      method: "DELETE",
      headers: { origin, cookie },
    })
  ).status,
  200,
);
console.log(
  "PASS: unauthenticated, wrong-origin, tampered-code, redemption, cookie, protected bank, invalid profile, complete report, logout",
);
