import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { questions50 } from "../lib/bigfive/data50.ts";
import { questions120 } from "../lib/bigfive/data120.ts";
import { scoreBigFive, facetNames } from "../lib/bigfive/scoring.ts";

for (const [count, items] of [
  [50, questions50],
  [120, questions120],
]) {
  test(count + ": balanced bank, original IDs and meaningful text", () => {
    assert.equal(items.length, count);
    assert.equal(new Set(items.map((q) => q.id)).size, count);
    for (const d of ["E", "A", "C", "N", "O"])
      assert.equal(items.filter((q) => q.domain === d).length, count / 5);
    assert.ok(
      items.every((q) => q.text.length > 3 && q.sourceEnglish.length > 3),
    );
    if (count === 120) {
      for (const key of Object.keys(facetNames))
        assert.equal(items.filter((q) => q.domain + q.facet === key).length, 4);
      assert.equal(Object.keys(facetNames).length, 30);
    } else assert.ok(items.every((q) => q.facet === undefined));
  });
  test(count + ": keyed extrema reverse exactly once", () => {
    for (const target of [0, 100]) {
      const answers = Object.fromEntries(
        items.map((q) => [
          q.id,
          target === 100 ? (q.reverse ? 1 : 5) : q.reverse ? 5 : 1,
        ]),
      );
      for (const result of scoreBigFive(items, answers)) {
        assert.equal(result.score, target);
        assert.equal(result.answered, count / 5);
        for (const facet of result.facets) assert.equal(facet.score, target);
      }
    }
  });
  test(
    count + ": skips, bad values and unknown IDs never inflate coverage",
    () => {
      const invalid = [null, undefined, 0, 6, NaN, Infinity, 2.5, "5"];
      const answers = Object.fromEntries(
        items.map((q, i) => [q.id, invalid[i % invalid.length]]),
      );
      answers.unrecognized = 5;
      for (const result of scoreBigFive(items, answers)) {
        assert.equal(result.answered, 0);
        assert.equal(result.raw, 0);
        assert.equal(result.score, null);
      }
    },
  );
  test(count + ": domain completeness boundary", () => {
    const subset = items.filter((q) => q.domain === "E");
    const min = Math.ceil(subset.length * 0.8);
    const answers = Object.fromEntries(
      subset.slice(0, min - 1).map((q) => [q.id, 3]),
    );
    assert.equal(
      scoreBigFive(items, answers).find((d) => d.dimension === "E").score,
      null,
    );
    answers[subset[min - 1].id] = 3;
    const result = scoreBigFive(items, answers).find(
      (d) => d.dimension === "E",
    );
    assert.equal(result.score, 50);
    assert.equal(result.raw, min * 3);
  });
}

test("facet needs three valid answers independently of domain coverage", () => {
  const subset = questions120.filter((q) => q.domain === "O" && q.facet === 6);
  const answers = Object.fromEntries(subset.slice(0, 2).map((q) => [q.id, 3]));
  const get = () =>
    scoreBigFive(questions120, answers).find((d) => d.dimension === "O");
  assert.equal(get().facets.find((f) => f.id === "O6").score, null);
  answers[subset[2].id] = 3;
  assert.equal(get().facets.find((f) => f.id === "O6").score, 50);
  assert.equal(get().score, null);
});

test("reject duplicate bank IDs instead of double-counting", () => {
  assert.throws(
    () => scoreBigFive([questions50[0], questions50[0]], {}),
    /Duplicate/,
  );
});

// Local provenance audit runs when the pinned upstream checkouts are available.
// CI still exercises all scoring and shape checks without downloaded sources.
test("original English, IDs, domains, facets and signs match pinned upstream", (t) => {
  const source50 = new URL(
    "../output/sources/bigfive-open/src/data/questions.ts",
    import.meta.url,
  );
  const source120 = new URL(
    "../output/sources/bigfive-web/packages/questions/src/data/en/questions.ts",
    import.meta.url,
  );
  if (!existsSync(source50) || !existsSync(source120))
    return t.skip("pinned upstream checkouts not present");
  const a = readFileSync(source50, "utf8");
  const b = readFileSync(source120, "utf8");
  const parsed50 = [
    ...a.matchAll(
      /\{\s*id:\s*(\d+),\s*text:\s*(['"])(.*?)\2,\s*domain:\s*'([EACNO])',\s*keyed:\s*'([+-])'\s*\}/g,
    ),
  ];
  const parsed120 = [
    ...b.matchAll(
      /\{\s*id:\s*'([^']+)',\s*text:\s*(['"])(.*?)\2,\s*keyed:\s*'(plus|minus)',\s*domain:\s*'([EACNO])',\s*facet:\s*(\d)\s*\}/g,
    ),
  ];
  assert.equal(parsed50.length, 50);
  assert.equal(parsed120.length, 120);
  parsed50.forEach((m, i) =>
    assert.deepEqual(
      [
        questions50[i].id,
        questions50[i].sourceEnglish,
        questions50[i].domain,
        questions50[i].reverse,
      ],
      [m[1], m[3], m[4], m[5] === "-"],
    ),
  );
  parsed120.forEach((m, i) =>
    assert.deepEqual(
      [
        questions120[i].id,
        questions120[i].sourceEnglish,
        questions120[i].domain,
        questions120[i].reverse,
        questions120[i].facet,
      ],
      [m[1], m[3], m[5], m[4] === "minus", Number(m[6])],
    ),
  );
});
