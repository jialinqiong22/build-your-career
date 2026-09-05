import test from "node:test";
import assert from "node:assert/strict";
import { valueQuestions, valueNames, valueDescriptions, scoreValues } from "../lib/values.ts";

test("original values: 40 unique questions evenly cover eight named priorities", () => {
  assert.equal(valueQuestions.length, 40);
  assert.equal(new Set(valueQuestions.map(q => q.id)).size, 40);
  assert.equal(new Set(valueQuestions.map(q => q.text)).size, 40);
  assert.equal(valueNames.length, 8);
  for (const name of valueNames) {
    assert.equal(valueQuestions.filter(q => q.dimension === name).length, 5);
    for (const field of ["meaning", "strength", "tradeoff"])
      assert.ok(valueDescriptions[name][field].length > 10);
  }
});

test("values: missing and skipped answers are insufficient evidence, not low scores", () => {
  for (const answers of [{}, Object.fromEntries(valueQuestions.map(q => [q.id, null]))]) {
    assert.ok(scoreValues(answers).every(r => r.score === null && r.answered === 0 && r.expected === 5));
  }
});

test("values: four valid responses required; mean does not count missing as zero", () => {
  const questions = valueQuestions.filter(q => q.dimension === valueNames[0]);
  const answers = Object.fromEntries(questions.slice(0, 3).map(q => [q.id, 5]));
  assert.equal(scoreValues(answers)[0].score, null);
  answers[questions[3].id] = 5;
  assert.equal(scoreValues(answers)[0].score, 100);
  assert.equal(scoreValues(answers)[0].answered, 4);
  answers[questions[4].id] = 1;
  assert.equal(scoreValues(answers)[0].score, 80);
});

test("values: raw importance endpoints and neutral are linear, not population percentiles", () => {
  for (const [answer, expected] of [[1, 0], [3, 50], [5, 100]]) {
    const answers = Object.fromEntries(valueQuestions.map(q => [q.id, answer]));
    assert.ok(scoreValues(answers).every(r => r.score === expected && r.answered === 5));
  }
});

test("values: unexpected IDs and malformed values do not raise coverage", () => {
  const bad = [0, 6, 2.5, NaN, Infinity, "5", undefined, null];
  const answers = Object.fromEntries(valueQuestions.map((q, i) => [q.id, bad[i % bad.length]]));
  answers.unknown = 5;
  assert.ok(scoreValues(answers).every(r => r.answered === 0 && r.score === null));
});
