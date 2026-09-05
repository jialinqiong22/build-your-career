import test from "node:test";
import assert from "node:assert/strict";
import { blankEvidence, evidenceBand, validEvidence } from "../lib/evidence.ts";
const example = (n) => ({
  ...blankEvidence(),
  status: "some",
  context: "课程调研问题" + n,
  action: "我设计了问卷并清洗数据" + n,
  outcome: "形成了一份分析表" + n,
  duration: "持续两周",
  feedback: "老师指出样本过少",
});
test("evidence tiers use structured information rather than length or self-rating", () => {
  assert.equal(evidenceBand([blankEvidence()]).tier, "limited");
  assert.equal(
    evidenceBand([
      { ...blankEvidence(), status: "some", action: "我很优秀".repeat(90) },
    ]).tier,
    "limited",
  );
  assert.equal(evidenceBand([example(1)]).tier, "some");
  assert.equal(evidenceBand([example(1), example(2)]).tier, "rich");
  assert.equal(evidenceBand([example(1), example(1)]).tier, "some");
  assert.equal(
    evidenceBand([
      { ...example(1), feedback: "" },
      { ...example(2), feedback: "" },
    ]).tier,
    "some",
  );
  assert.equal(
    evidenceBand([{ ...example(1), status: "none" }]).tier,
    "limited",
  );
});
test("evidence schema rejects malformed and oversized fields", () => {
  assert.equal(validEvidence(blankEvidence()), true);
  assert.equal(validEvidence(null), false);
  assert.equal(
    validEvidence({ ...blankEvidence(), need: "a".repeat(401) }),
    false,
  );
  assert.equal(validEvidence({ ...blankEvidence(), status: "rich" }), false);
});
