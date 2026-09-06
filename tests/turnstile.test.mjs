import assert from "node:assert/strict";
import test from "node:test";
import { verifyTurnstile } from "../lib/turnstile.ts";

const verify = (response, overrides = {}) =>
  verifyTurnstile({
    token: "test-token",
    secret: "test-secret",
    expectedHostname: "example.com",
    expectedAction: "register",
    fetcher: async (url, init) => {
      assert.equal(
        url,
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      );
      assert.equal(init?.method, "POST");
      assert.equal(init?.cache, "no-store");
      const body = new URLSearchParams(String(init?.body));
      assert.equal(body.get("secret"), "test-secret");
      assert.equal(body.get("response"), "test-token");
      return Response.json(response);
    },
    ...overrides,
  });

test("accepts a successful response bound to the registration action and host", async () => {
  assert.deepEqual(
    await verify({ success: true, hostname: "EXAMPLE.COM", action: "register" }),
    { ok: true },
  );
});

test("rejects failed, wrong-action, and wrong-host responses", async () => {
  assert.deepEqual(await verify({ success: false }), {
    ok: false,
    reason: "invalid",
  });
  assert.deepEqual(
    await verify({ success: true, hostname: "example.com", action: "login" }),
    { ok: false, reason: "invalid" },
  );
  assert.deepEqual(
    await verify({ success: true, hostname: "evil.example", action: "register" }),
    { ok: false, reason: "invalid" },
  );
});

test("rejects absent or oversized tokens before making a request", async () => {
  const fetcher = async () => {
    throw new Error("fetch should not run");
  };
  assert.deepEqual(await verifyTurnstile({ token: "", secret: "secret", expectedHostname: "example.com", expectedAction: "register", fetcher }), {
    ok: false,
    reason: "invalid",
  });
  assert.deepEqual(await verifyTurnstile({ token: "x".repeat(2049), secret: "secret", expectedHostname: "example.com", expectedAction: "register", fetcher }), {
    ok: false,
    reason: "invalid",
  });
});

test("fails closed when the secret is missing or Cloudflare is unavailable", async () => {
  assert.deepEqual(await verifyTurnstile({ token: "token", secret: undefined, expectedHostname: "example.com", expectedAction: "register" }), {
    ok: false,
    reason: "misconfigured",
  });
  assert.deepEqual(
    await verify({}, { fetcher: async () => { throw new Error("offline"); } }),
    { ok: false, reason: "unavailable" },
  );
});
