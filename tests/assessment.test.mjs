import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blank,
  validProfile,
  interests,
  traits,
  score,
  report,
  finished,
} from "../lib/assessment.ts";
test("unknown and missing answers never become low scores", () => {
  const p = blank();
  interests.forEach((q) => (p.answers[q.id] = null));
  assert.ok(score(interests, p.answers).every((x) => x.score === null));
  assert.equal(report(p).leading.length, 0);
});
test("reverse scoring and minimum coverage", () => {
  const p = blank();
  p.answers.tO0 = 5;
  assert.equal(score(traits, p.answers)[0].score, null);
  p.answers.tO2 = 1;
  assert.equal(score(traits, p.answers)[0].score, 100);
  p.answers.tO0 = 1;
  p.answers.tO2 = 5;
  assert.equal(score(traits, p.answers)[0].score, 0);
});
test("flat profile has no forced identity", () => {
  const p = blank();
  interests.forEach((q) => (p.answers[q.id] = 5));
  assert.equal(report(p).leading.length, 0);
});
test("interest and evidence remain separate", () => {
  const p = blank();
  interests.forEach((q) => (p.answers[q.id] = q.dimension === "I" ? 5 : 1));
  assert.equal(report(p).leading[0].dimension, "I");
  assert.match(report(p).flags.join(""), /没有行为/);
});
test("restored records reject invalid ranges, versions, shapes and duplicates", () => {
  assert.equal(validProfile(blank()), true);
  for (const patch of [
    { version: "old" },
    { answers: { iI0: 6 } },
    { answers: { bogus: 1 } },
    { answers: [] },
    { priorities: ["成长精进", "成长精进"] },
    { evidence: [] },
    { target: null },
  ])
    assert.equal(validProfile({ ...blank(), ...patch }), false);
});
test("complete profile permits explicit skips but requires evidence detail", () => {
  const p = blank();
  assert.equal(finished(p), false);
  [...interests, ...traits].forEach((q) => (p.answers[q.id] = null));
  p.priorities = ["成长精进", "稳定安全", "自主空间"];
  assert.equal(finished(p), true);
  p.evidence[0].level = 1;
  assert.equal(finished(p), false);
  p.evidence[0].text = "我查阅三个资料来源并写出比较总结，发现不同口径。";
  assert.equal(finished(p), true);
  assert.ok(report(p).conflicts.length);
});
