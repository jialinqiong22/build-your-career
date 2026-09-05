import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeIdentifier,
  normalizeUsername,
  validatePassword,
  readAuthBody,
} from "../lib/auth-validation.ts";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  privateDigest,
  sessionCookie,
  validSessionToken,
} from "../lib/auth-crypto.ts";

test("email normalization and malformed inputs", () => {
  assert.deepEqual(normalizeIdentifier(" Person+Test@Example.COM "), {
    kind: "email",
    value: "person+test@example.com",
  });
  for (const value of [
    null,
    {},
    "",
    "foo@",
    "a..b@example.com",
    "a@-example.com",
    "a@b",
    "a b@example.com",
    "a@b.com\nother",
  ])
    assert.throws(() => normalizeIdentifier(value));
});
test("phone canonicalization equates mainland aliases and preserves international prefix", () => {
  assert.deepEqual(
    normalizeIdentifier("138 0013 8000"),
    normalizeIdentifier("+86 13800138000"),
  );
  assert.equal(normalizeIdentifier("+1 (202) 555-0123").value, "+12025550123");
  for (const value of [
    "123456",
    "+8612345678901",
    "00441234567890",
    "phone",
    "+01234567890",
  ])
    assert.throws(() => normalizeIdentifier(value));
});
test("username constraints and unicode normalization", () => {
  assert.equal(normalizeUsername(" 观己学生 "), "观己学生");
  assert.equal(normalizeUsername("Cafe\u0301"), "Café");
  for (const value of ["x", "a".repeat(31), "<script>", "a b", "a\nname"])
    assert.throws(() => normalizeUsername(value));
});
test("password limits count UTF8 bytes without trimming or normalizing", () => {
  assert.equal(validatePassword("  password12  "), "  password12  ");
  assert.equal(validatePassword("中".repeat(24)), "中".repeat(24));
  for (const value of [
    "short",
    "中".repeat(25),
    "a".repeat(73),
    "abcd12345678\0",
  ])
    assert.throws(() => validatePassword(value));
});
test("bcrypt passwords have cost12 salt and verify only exact input", async () => {
  const password = " Test-password-2026 ";
  const first = await hashPassword(password),
    second = await hashPassword(password);
  assert.match(first, /^\$2b\$12\$/);
  assert.notEqual(first, second);
  assert.equal(first.length, 60);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword(password.trim(), first), false);
});
test("opaque sessions hash at rest and production cookies are host-only secure", () => {
  const token = newSessionToken(),
    secret = "s".repeat(48);
  assert.equal(validSessionToken(token), true);
  assert.notEqual(token, newSessionToken());
  assert.notEqual(privateDigest(token, secret), token);
  assert.notEqual(
    privateDigest(token, secret),
    privateDigest(token, "t".repeat(48)),
  );
  assert.throws(() => privateDigest(token, "short"));
  assert.match(sessionCookie(token, false, true), /^__Host-career_session=/);
  assert.match(
    sessionCookie(token, false, true),
    /HttpOnly; SameSite=Lax; Max-Age=604800; Secure/,
  );
  assert.doesNotMatch(sessionCookie(token, false, true), /Domain=/);
  assert.match(sessionCookie("", true, false), /Max-Age=0/);
  assert.throws(() => sessionCookie("forged"));
});
test("bounded JSON rejects content types, arrays, malformed and oversized bodies", async () => {
  const request = (body, type = "application/json") =>
    new Request("https://example.com", {
      method: "POST",
      headers: { "Content-Type": type },
      body,
    });
  assert.deepEqual(await readAuthBody(request('{"username":"ok"}')), {
    username: "ok",
  });
  for (const body of ["[]", "null", "{", '"text"'])
    await assert.rejects(readAuthBody(request(body)));
  await assert.rejects(readAuthBody(request("{}", "text/plain")), {
    status: 415,
  });
  await assert.rejects(readAuthBody(request("a".repeat(4097))), {
    status: 413,
  });
});
