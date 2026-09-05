import type {
  BigFiveQuestion,
  BigFiveScore,
  BigFiveDomainScore,
  BigFiveDomain,
} from "./types.ts";

export const version = "ipip-local-zh-v1";
export const facetNames: Record<string, string> = {
  N1: "焦虑倾向",
  N2: "易怒倾向",
  N3: "低落倾向",
  N4: "社交自我意识",
  N5: "冲动倾向",
  N6: "压力易感性",
  E1: "友善交往",
  E2: "合群性",
  E3: "主导性",
  E4: "活动水平",
  E5: "刺激寻求",
  E6: "积极情绪",
  O1: "想象力",
  O2: "审美兴趣",
  O3: "情感体验",
  O4: "尝新倾向",
  O5: "思辨兴趣",
  O6: "观念开放",
  A1: "信任",
  A2: "坦诚",
  A3: "利他倾向",
  A4: "合作倾向",
  A5: "谦逊",
  A6: "同情心",
  C1: "自我效能感",
  C2: "条理性",
  C3: "责任感",
  C4: "成就追求",
  C5: "自律",
  C6: "审慎",
};

function summarize(
  items: readonly BigFiveQuestion[],
  answers: Record<string, number | null>,
  coverage: number,
): BigFiveScore {
  let answered = 0;
  let raw = 0;
  for (const item of items) {
    const value = answers[item.id];
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    )
      continue;
    answered++;
    raw += item.reverse ? 6 - value : value;
  }
  return {
    answered,
    expected: items.length,
    raw,
    score:
      items.length > 0 && answered >= Math.ceil(items.length * coverage)
        ? Math.round(((raw / answered - 1) / 4) * 100)
        : null,
  };
}

/** Local completeness policy: >=80% domain, >=75% facet (3/4 items).
 * Missing/invalid values are excluded, never interpreted as neutral or zero.
 * N scores describe negative emotional reactivity, not emotional stability.
 */
export function scoreBigFive(
  items: readonly BigFiveQuestion[],
  answers: Record<string, number | null>,
): BigFiveDomainScore[] {
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error("Duplicate Big Five question IDs");
  return (["O", "C", "E", "A", "N"] as BigFiveDomain[]).map((dimension) => {
    const domainItems = items.filter((item) => item.domain === dimension);
    const facetIds = [
      ...new Set(
        domainItems.flatMap((item) =>
          item.facet === undefined ? [] : [item.facet],
        ),
      ),
    ].sort((a, b) => a - b);
    return {
      dimension,
      ...summarize(domainItems, answers, 0.8),
      facets: facetIds.map((facet) => ({
        id: `${dimension}${facet}`,
        name: facetNames[`${dimension}${facet}`] ?? `${dimension}${facet}`,
        ...summarize(
          domainItems.filter((item) => item.facet === facet),
          answers,
          0.75,
        ),
      })),
    };
  });
}
