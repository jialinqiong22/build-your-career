import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE_MAX_ATTEMPTS,
  CODE_RESEND_INTERVAL_SECONDS,
  CODE_TTL_SECONDS,
  newVerificationCode,
  normalizePurpose,
  normalizeVerificationCode,
  verificationCodeDigest,
} from "../lib/auth-email-crypto.ts";
import { privateDigest } from "../lib/auth-crypto.ts";

test("verification codes are six digits and drawn from a wide space", () => {
  const codes = new Set();
  for (let i = 0; i < 50; i++) {
    const code = newVerificationCode();
    assert.match(code, /^\d{6}$/);
    codes.add(code);
  }
  assert.ok(codes.size > 1, "codes should not be constant");
});

test("verification code input accepts only six digits and rejects the rest", () => {
  assert.equal(normalizeVerificationCode(" 012345 "), "012345");
  for (const value of [null, {}, "", "12345", "1234567", "12a456", "12 456"])
    assert.throws(() => normalizeVerificationCode(value));
});

test("purpose is restricted to register and password_reset", () => {
  assert.equal(normalizePurpose("register"), "register");
  assert.equal(normalizePurpose("password_reset"), "password_reset");
  for (const value of ["login", "REGISTER", "", null, 1])
    assert.throws(() => normalizePurpose(value));
});

test("codes hash at rest as namespaced digests bound to email and purpose", () => {
  const secret = "s".repeat(48);
  const digest = verificationCodeDigest("register", "a@example.com", "123456", secret);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, "123456");
  // Same digits, different email or purpose must produce a different digest.
  assert.notEqual(
    digest,
    verificationCodeDigest("register", "b@example.com", "123456", secret),
  );
  assert.notEqual(
    digest,
    verificationCodeDigest("password_reset", "a@example.com", "123456", secret),
  );
  assert.equal(
    digest,
    privateDigest("code:register:a@example.com:123456", secret),
  );
  assert.throws(() => verificationCodeDigest("register", "a@example.com", "123456", "short"));
});

test("code limits stay conservative", () => {
  assert.equal(CODE_TTL_SECONDS, 600);
  assert.equal(CODE_MAX_ATTEMPTS, 5);
  assert.equal(CODE_RESEND_INTERVAL_SECONDS, 60);
});
