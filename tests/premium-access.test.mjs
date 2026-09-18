import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  issueAccessCode,
  verifyPremiumToken,
  createPremiumSession,
  premiumConfigured,
  premiumAccessFromRequest,
  PREMIUM_COOKIE,
  SESSION_SECONDS,
  planForGrant,
} from "../lib/premium-access.ts";

test("signed manual access grants enforce scope, expiry, revocation and bounded sessions", () => {
  const previous = {
    secret: process.env.PREMIUM_ACCESS_SECRET,
    revoked: process.env.PREMIUM_REVOKED_ORDERS,
  };
  try {
    delete process.env.PREMIUM_ACCESS_SECRET;
    assert.equal(premiumConfigured(), false);
    assert.throws(() => issueAccessCode("order", 2000000000));
    process.env.PREMIUM_ACCESS_SECRET = "short";
    assert.equal(premiumConfigured(), false);
    process.env.PREMIUM_ACCESS_SECRET = randomBytes(32).toString("hex");
    delete process.env.PREMIUM_REVOKED_ORDERS;
    const now = Math.floor(Date.now() / 1000);
    const code = issueAccessCode("ORDER_001", now + SESSION_SECONDS * 3, now, 42, "guided");
    assert.equal(verifyPremiumToken(code, "code", now).order, "ORDER_001");
    assert.equal(verifyPremiumToken(code, "session", now), null);
    assert.equal(
      verifyPremiumToken(code, "code", now + SESSION_SECONDS * 3),
      null,
    );
    const session = createPremiumSession(code, 42, now);
    assert.equal(createPremiumSession(code, 43, now), null);
    assert.equal(session.maxAge, SESSION_SECONDS);
    assert.equal(verifyPremiumToken(session.token, "code", now), null);
    assert.ok(verifyPremiumToken(session.token, "session", now));
    assert.equal(
      verifyPremiumToken(session.token, "session", now + SESSION_SECONDS),
      null,
    );
    assert.equal(
      createPremiumSession(issueAccessCode("SOON", now + 20, now, 42), 42, now).maxAge,
      20,
    );
    const request = new Request("https://example.test/api", {
      headers: { cookie: `${PREMIUM_COOKIE}=${session.token}` },
    });
    assert.equal(premiumAccessFromRequest(request, 42).order, "ORDER_001");
    assert.equal(premiumAccessFromRequest(request), null);
    assert.equal(premiumAccessFromRequest(request, 43), null);
    assert.equal(planForGrant(premiumAccessFromRequest(request, 42)), "guided");
    const standard = issueAccessCode("STANDARD", now + 100, now, 42, "standard");
    assert.equal(planForGrant(verifyPremiumToken(standard, "code", now)), "standard");
    assert.equal(planForGrant(null), "free");
    for (const token of [
      "",
      "bad",
      `${code}.more`,
      code.slice(0, -4),
      "x".repeat(1025),
    ])
      assert.equal(verifyPremiumToken(token, "code", now), null);
    const [body, sig] = code.split(".");
    const changed = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(body, "base64url")),
        exp: now + 999999,
      }),
    ).toString("base64url");
    assert.equal(verifyPremiumToken(`${changed}.${sig}`, "code", now), null);
    function signed(overrides) {
      const payload = Buffer.from(
        JSON.stringify({
          v: 1,
          kind: "code",
          order: "ORDER_001",
          product: "career-complete-199",
          exp: now + 100,
          ...overrides,
        }),
      ).toString("base64url");
      return `${payload}.${createHmac("sha256", process.env.PREMIUM_ACCESS_SECRET).update(payload).digest("base64url")}`;
    }
    for (const overrides of [
      { product: "other" },
      { exp: "tomorrow" },
      { exp: 1.5 },
      { v: 2 },
      { extra: true },
      { order: "../unsafe" },
    ])
      assert.equal(verifyPremiumToken(signed(overrides), "code", now), null);
    assert.throws(() => issueAccessCode("email@example.com", now + 100, now));
    assert.throws(() => issueAccessCode("order", now, now));
    process.env.PREMIUM_REVOKED_ORDERS = "OTHER, ORDER_001";
    assert.equal(verifyPremiumToken(code, "code", now), null);
    assert.equal(premiumAccessFromRequest(request), null);
    assert.throws(() => issueAccessCode("ORDER_001", now + 100, now));
    delete process.env.PREMIUM_REVOKED_ORDERS;
    process.env.PREMIUM_ACCESS_SECRET = randomBytes(32).toString("hex");
    assert.equal(verifyPremiumToken(code, "code", now), null);
  } finally {
    for (const [key, value] of [
      ["PREMIUM_ACCESS_SECRET", previous.secret],
      ["PREMIUM_REVOKED_ORDERS", previous.revoked],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("issuer rejects missing timezone and impossible dates without outputting a code", () => {
  for (const expiry of ["2027-01-01", "2027-02-30T00:00:00Z"]) {
    const run = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "scripts/issue-access-code.mjs",
        "--order",
        "TEST",
        "--expires",
        expiry,
        "--user", "42", "--plan", "standard",
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PREMIUM_ACCESS_SECRET: randomBytes(32).toString("hex"),
        },
      },
    );
    assert.equal(run.status, 1);
    assert.equal(run.stdout, "");
  }
});

test("legacy orders need explicit ownership before redemption or cookie use", () => {
  const oldSecret = process.env.PREMIUM_ACCESS_SECRET;
  const oldOwners = process.env.PREMIUM_LEGACY_ORDER_OWNERS;
  try {
    process.env.PREMIUM_ACCESS_SECRET = randomBytes(32).toString("hex");
    delete process.env.PREMIUM_LEGACY_ORDER_OWNERS;
    const now = Math.floor(Date.now() / 1000);
    const code = issueAccessCode("LEGACY", now + 100, now);
    assert.ok(verifyPremiumToken(code, "code", now));
    assert.equal(createPremiumSession(code, 42, now), null);
    process.env.PREMIUM_LEGACY_ORDER_OWNERS = JSON.stringify({ LEGACY: 42 });
    const session = createPremiumSession(code, 42, now);
    assert.ok(session);
    assert.equal(createPremiumSession(code, 43, now), null);
    assert.equal(verifyPremiumToken(session.token, "session", now).userId, 42);
    process.env.PREMIUM_LEGACY_ORDER_OWNERS = "broken";
    assert.equal(createPremiumSession(code, 42, now), null);
  } finally {
    for (const [key, value] of [["PREMIUM_ACCESS_SECRET", oldSecret], ["PREMIUM_LEGACY_ORDER_OWNERS", oldOwners]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
