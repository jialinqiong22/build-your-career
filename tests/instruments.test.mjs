import test from "node:test";
import assert from "node:assert/strict";
import {
  hollandQuestions,
  hollandNames,
  hollandDescriptions,
  enneagramQuestions,
  instrumentMetadata,
  scoreInstrument,
} from "../lib/instruments.ts";
import { interests } from "../lib/assessment.ts";

test("Holland preserves existing original items, IDs, and accurate metadata", () => {
  assert.deepEqual(hollandQuestions, interests);
  assert.equal(hollandQuestions.length, 18);
  assert.equal(instrumentMetadata.holland.count, 18);
  assert.equal(new Set(hollandQuestions.map((q) => q.id)).size, 18);
  for (const key of Object.keys(hollandNames)) {
    assert.equal(hollandQuestions.filter((q) => q.dimension === key).length, 3);
    assert.ok(hollandDescriptions[key].meaning);
    assert.ok(hollandDescriptions[key].strength);
    assert.ok(hollandDescriptions[key].tradeoff);
  }
});
test("scoring excludes missing, skipped, invalid and inherited answers", () => {
  const q = Array.from({ length: 5 }, (_, i) => ({
    id: `q${i}`,
    text: "test",
    dimension: "X",
  }));
  assert.equal(
    scoreInstrument(q, { q0: 5, q1: 5, q2: 5, q3: 5, q4: null })[0].score,
    100,
  );
  assert.equal(
    scoreInstrument(q, { q0: 5, q1: 5, q2: 5, q3: 6, q4: 2.5 })[0].score,
    null,
  );
  assert.equal(
    scoreInstrument(q, Object.create({ q0: 5, q1: 5, q2: 5, q3: 5, q4: 5 }))[0]
      .score,
    null,
  );
  assert.equal(scoreInstrument(q, {})[0].answered, 0);
});
test("scoring endpoints, reversal, and invalid coverage", () => {
  const q = [
    { id: "a", text: "a", dimension: "A" },
    { id: "b", text: "b", dimension: "A", reverse: true },
  ];
  assert.equal(scoreInstrument(q, { a: 5, b: 1 })[0].score, 100);
  assert.equal(scoreInstrument(q, { a: 1, b: 5 })[0].score, 0);
  assert.equal(scoreInstrument(q, { a: 3, b: 3 })[0].score, 50);
  for (const n of [0, -1, 2, NaN])
    assert.throws(() => scoreInstrument(q, {}, n), RangeError);
});
test("Enneagram has 36 original prompts and exploratory metadata", () => {
  assert.equal(enneagramQuestions.length, 36);
  assert.equal(new Set(enneagramQuestions.map((q) => q.id)).size, 36);
  assert.equal(new Set(enneagramQuestions.map((q) => q.text)).size, 36);
  for (const dimension of ["1", "2", "3", "4", "5", "6", "7", "8", "9"])
    assert.equal(
      enneagramQuestions.filter((q) => q.dimension === dimension).length,
      4,
    );
  assert.equal(instrumentMetadata.enneagram.status, "original-exploratory");
  assert.equal(instrumentMetadata.enneagram.count, 36);
  const all = Object.fromEntries(enneagramQuestions.map((q) => [q.id, 3]));
  assert.ok(
    scoreInstrument(enneagramQuestions, all).every((s) => s.score === 50),
  );
  all.en1_1 = null;
  assert.equal(
    scoreInstrument(enneagramQuestions, all).find((s) => s.dimension === "1")
      .score,
    null,
  );
});
