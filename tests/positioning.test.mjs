import test from "node:test";
import assert from "node:assert/strict";
import {
  blank,
  validProfile,
  finished,
  report,
  completion,
} from "../lib/positioning.ts";
import { questions120 } from "../lib/bigfive/data120.ts";
import { hollandQuestions, enneagramQuestions } from "../lib/instruments.ts";
import { valueQuestions, valueNames } from "../lib/values.ts";
const banks = { bigFive: questions120, enneagram: enneagramQuestions };
function complete() {
  const p = blank();
  p.priorities = valueNames.slice(0, 3);
  p.evidence = p.evidence.map((e) => ({ ...e, status: "none" }));
  p.enneagramChoice = "skip";
  for (const q of [...valueQuestions, ...hollandQuestions, ...questions120])
    p.answers[q.id] = 3;
  return p;
}
test("V4 separates optional module and requires explicit completion", () => {
  const p = complete();
  assert.equal(finished(p, banks), true);
  assert.deepEqual(completion(p, banks), [true, true, true, true, true]);
  p.enneagramChoice = "undecided";
  assert.equal(finished(p, banks), false);
  p.enneagramChoice = "take";
  assert.equal(finished(p, banks), false);
  for (const q of enneagramQuestions) p.enneagramAnswers[q.id] = null;
  assert.equal(finished(p, banks), true);
  p.enneagramChoice = "skip";
  assert.equal(validProfile(p, banks), false);
});
test("optional motives cannot change any core score, tier, summary or next action", () => {
  const p = complete(),
    baseline = report(p, banks);
  p.enneagramChoice = "take";
  for (const q of enneagramQuestions) p.enneagramAnswers[q.id] = 5;
  assert.deepEqual(report(p, banks), baseline);
});
test("stage and direction do not change evidence tiers or trait scores", () => {
  const p = complete(),
    baseline = report(p, banks);
  p.stage = "硕士应届";
  p.direction = "已有明确目标";
  const r = report(p, banks);
  assert.deepEqual(r.evidence, baseline.evidence);
  assert.deepEqual(r.values, baseline.values);
  assert.deepEqual(r.interest, baseline.interest);
  assert.equal(r.summary, baseline.summary);
  assert.notEqual(r.directionAdvice, baseline.directionAdvice);
  assert.equal("totalScore" in r, false);
});
test("old schema, invalid IDs, fractions, duplicates and oversized fields rejected", () => {
  const p = complete();
  assert.equal(validProfile({ ...p, version: "3.0-ipip" }, banks), false);
  assert.equal(
    validProfile({ ...p, answers: { ...p.answers, unknown: 5 } }, banks),
    false,
  );
  assert.equal(
    validProfile({ ...p, priorities: [valueNames[0], valueNames[0]] }, banks),
    false,
  );
  assert.equal(validProfile({ ...p, target: "x".repeat(201) }, banks), false);
  p.answers[valueQuestions[0].id] = 1.5;
  assert.equal(validProfile(p, banks), false);
});
test("unknown answers give missing information not low scores, and explicit skips can finish", () => {
  const p = complete();
  for (const k of Object.keys(p.answers)) p.answers[k] = null;
  assert.equal(finished(p, banks), true);
  const r = report(p, banks);
  assert.ok(r.values.every((d) => d.score === null));
  assert.ok(r.interest.every((d) => d.score === null));
  assert.ok(r.traits.every((d) => d.score === null));
  assert.equal(r.interestTop.length, 0);
});
