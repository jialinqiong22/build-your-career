import test from "node:test";
import assert from "node:assert/strict";
import {validProgressPayload, isProgressKind, validProgressRevision} from "../lib/progress-validation.ts";
import {randomUUID} from "node:crypto";
test("cloud revisions require a fresh UUID rather than reusable counters", () => {
  assert.equal(validProgressRevision(0), true);
  assert.equal(validProgressRevision(randomUUID()), true);
  assert.equal(validProgressRevision(1), false);
  assert.equal(validProgressRevision("not-a-revision"), false);
  assert.notEqual(randomUUID(), randomUUID());
});
test("cloud payload bounds reject oversized, deep and unsafe records", () => {
  assert.equal(validProgressPayload({answers: {a: 3, b: null}, consent: true}), true);
  assert.equal(validProgressPayload([]), false);
  assert.equal(validProgressPayload({a: "x".repeat(10001)}), false);
  assert.equal(validProgressPayload(JSON.parse('{"__proto__": {"admin": true}}')), false);
  let nested = {}; for(let i = 0; i < 15; i++) nested = {nested};
  assert.equal(validProgressPayload(nested), false);
  assert.equal(validProgressPayload({a: Infinity}), false);
  assert.equal(isProgressKind("suite120"), true);
  assert.equal(isProgressKind("other"), false);
});
