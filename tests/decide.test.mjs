import test from "node:test";
import assert from "node:assert/strict";
import {
  blankInput,
  brief,
  cleanDirection,
  landingSamples,
  namedDirections,
  parseStored,
  ready,
} from "../lib/decide.ts";

function complete(patch = {}) {
  const input = blankInput();
  for (const id of Object.keys(input.choices)) {
    input.choices[id] = { trade: "left", task: "left" };
  }
  input.directions = ["咨询", "研究", ""];
  input.stuck = "growth";
  input.experience = "none";
  return { ...input, ...patch, choices: patch.choices ?? input.choices };
}

test("named directions are trimmed, capped, and ignored when undeclared", () => {
  assert.equal(cleanDirection("  家里希望的银行管培  \n"), "家里希望的银行管培");
  assert.equal(cleanDirection("甲".repeat(50)).length, 40);
  const named = complete();
  assert.deepEqual(namedDirections(named), ["咨询", "研究"]);
  assert.deepEqual(namedDirections({ ...named, mode: "none", directions: ["咨询", "研究", ""] }), []);
});

test("brief names the stuck tradeoff and omits the private note", () => {
  const note = "课程里独立拆过一个案例并访谈了两位学长";
  const input = complete({
    experience: "some",
    experienceNote: note,
    choices: {
      ...complete().choices,
      growth: { trade: "left", task: "right" },
    },
  });
  assert.equal(ready(input), true);
  const result = brief(input);
  assert.match(result.conflict, /咨询/);
  assert.match(result.conflict, /研究/);
  assert.match(result.conflict, /成长空间/);
  assert.match(result.conflict, /稳定可预期/);
  assert.match(result.conflict, /真要动手时/);
  assert.equal(result.conflict.includes(note), false);
  assert.equal(result.experiment.includes(note), false);
  assert.match(result.experiment, /真会做的/);
});

test("no declared direction stays on the task instead of inventing a career", () => {
  const result = landingSamples.open;
  assert.match(result.conflict, /还没写下具体方向/);
  assert.match(result.conflict, /独自把问题想透/);
  assert.equal(result.conflict.includes("咨询"), false);
  assert.match(result.experiment, /安静的下午/);
});

test("landing sample for two directions is the growth conflict", () => {
  assert.match(landingSamples.named.conflict, /咨询/);
  assert.match(landingSamples.named.conflict, /成长空间/);
  assert.match(landingSamples.named.experiment, /三个你真的好奇的问题/);
});

test("incomplete answers do not produce a brief", () => {
  const input = blankInput();
  assert.equal(ready(input), false);
  assert.throws(() => brief(input), /incomplete/);
});

test("stored drafts reject unknown shapes and unfinished results", () => {
  assert.equal(parseStored("not-json"), null);
  assert.equal(parseStored(JSON.stringify({ version: 2, step: 0, input: complete() })), null);
  const unfinished = complete();
  unfinished.stuck = null;
  assert.equal(parseStored(JSON.stringify({ version: 1, step: 4, input: unfinished })), null);
  const stored = parseStored(JSON.stringify({ version: 1, step: 1, input: complete() }));
  assert.equal(stored?.step, 1);
  assert.equal(stored?.input.stuck, "growth");
});
