import test from "node:test";
import assert from "node:assert/strict";
import {
  buildShareInterpretation,
  parseShareScores,
} from "../lib/share-card.ts";

const sample = { O: 85, C: 48, E: 35, A: 63, N: 55 };

test("share interpretation is deterministic, concise and tailored", () => {
  const result = buildShareInterpretation(sample);
  assert.ok(result);
  assert.match(result.strengths, /curious/);
  assert.match(result.strengths, /thoughtful/);
  assert.match(result.watchOuts, /novelty/);
  assert.ok(
    Object.values(result).join(" ").trim().split(/\s+/).length <= 200,
  );
  assert.deepEqual(buildShareInterpretation(sample), result);
});

test("interpretation uses emotional stability rather than raw sensitivity", () => {
  const steady = buildShareInterpretation({ O: 50, C: 50, E: 50, A: 50, N: 5 });
  assert.ok(steady);
  assert.match(steady.strengths, /steady under pressure/);
});

test("incomplete scores do not produce personality claims", () => {
  assert.equal(buildShareInterpretation({ ...sample, E: null }), null);
});

test("share score parser still rejects extra or out-of-range data", () => {
  assert.deepEqual(parseShareScores(sample), sample);
  assert.equal(parseShareScores({ ...sample, email: "person@example.com" }), null);
  assert.equal(parseShareScores({ ...sample, O: 101 }), null);
});
