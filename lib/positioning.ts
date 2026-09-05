import {
  valueQuestions,
  scoreValues,
  valueNames,
  type ValueDimension,
} from "./values.ts";
import {
  hollandQuestions,
  scoreInstrument,
  hollandNames,
} from "./instruments.ts";
import {
  blankEvidence,
  evidenceBand,
  validEvidence,
  evidenceCategories,
  type Evidence,
} from "./evidence.ts";
import { scoreBigFive } from "./bigfive/scoring.ts";
import type { BigFiveQuestion } from "./bigfive/types.ts";
export const VERSION = "4.0-layered";
export const KEY = "career-positioning-v4";
export const stages = ["本科在读", "硕士在读", "本科应届", "硕士应届"];
export const directions = [
  "还没有方向",
  "知道不想要什么",
  "有大致方向",
  "已有明确目标",
];
export type OptionalQuestion = {
  id: string;
  text: string;
  dimension: string;
  reverse?: boolean;
};
export type SuiteBanks = {
  bigFive: readonly BigFiveQuestion[];
  enneagram: readonly OptionalQuestion[];
};
export type Profile = {
  version: string;
  stage: string;
  direction: string;
  target: string;
  answers: Record<string, number | null>;
  priorities: ValueDimension[];
  evidence: Evidence[];
  enneagramChoice: "undecided" | "skip" | "take";
  enneagramAnswers: Record<string, number | null>;
};
export function blank(): Profile {
  return {
    version: VERSION,
    stage: stages[0],
    direction: directions[0],
    target: "",
    answers: {},
    priorities: [],
    evidence: evidenceCategories.map(() => blankEvidence()),
    enneagramChoice: "undecided",
    enneagramAnswers: {},
  };
}
function validAnswers(
  value: unknown,
  items: readonly { id: string }[],
): value is Record<string, number | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const ids = new Set(items.map((q) => q.id));
  return Object.entries(value).every(
    ([id, v]) =>
      ids.has(id) &&
      (v === null ||
        (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5)),
  );
}
export function validProfile(
  value: unknown,
  banks: SuiteBanks,
): value is Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const p = value as Profile;
  return (
    p.version === VERSION &&
    stages.includes(p.stage) &&
    directions.includes(p.direction) &&
    typeof p.target === "string" &&
    p.target.length <= 200 &&
    validAnswers(p.answers, [
      ...valueQuestions,
      ...hollandQuestions,
      ...banks.bigFive,
    ]) &&
    Array.isArray(p.priorities) &&
    p.priorities.length <= 3 &&
    new Set(p.priorities).size === p.priorities.length &&
    p.priorities.every((x) => valueNames.includes(x)) &&
    Array.isArray(p.evidence) &&
    p.evidence.length === evidenceCategories.length &&
    p.evidence.every(validEvidence) &&
    ["undecided", "skip", "take"].includes(p.enneagramChoice) &&
    validAnswers(p.enneagramAnswers, banks.enneagram) &&
    (p.enneagramChoice === "take" ||
      Object.keys(p.enneagramAnswers).length === 0)
  );
}
export const handled = (
  items: readonly { id: string }[],
  answers: Record<string, number | null>,
) => items.length > 0 && items.every((q) => Object.hasOwn(answers, q.id));
export function completion(p: Profile, banks: SuiteBanks) {
  return [
    handled(valueQuestions, p.answers) && p.priorities.length === 3,
    handled(hollandQuestions, p.answers),
    handled(banks.bigFive, p.answers),
    p.evidence.every((e) => e.status !== "unanswered"),
    p.enneagramChoice === "skip" ||
      (p.enneagramChoice === "take" &&
        handled(banks.enneagram, p.enneagramAnswers)),
  ];
}
export function finished(p: Profile, banks: SuiteBanks) {
  return validProfile(p, banks) && completion(p, banks).every(Boolean);
}
function leading<T extends { score: number | null }>(scores: T[]) {
  const sorted = scores
    .filter((x) => x.score !== null)
    .sort((a, b) => b.score! - a.score!);
  if (!sorted.length) return [];
  const top = sorted.filter((x) => sorted[0].score! - x.score! <= 8);
  return top.length <= 3 && top[0].score! >= 50 ? top : [];
}
export function report(p: Profile, banks: SuiteBanks) {
  const interest = scoreInstrument(hollandQuestions, p.answers),
    values = scoreValues(p.answers),
    traits = scoreBigFive(banks.bigFive, p.answers),
    evidence = evidenceBand(p.evidence);
  const interestTop = leading(interest),
    valueTop = leading(values);
  const interestPhrase = interestTop.length
    ? interestTop.map((d) => hollandNames[d.dimension]).join("、")
    : "尚未明显分化的多类活动";
  const coreTotal =
    valueQuestions.length + hollandQuestions.length + banks.bigFive.length;
  const answered = [
    ...valueQuestions,
    ...hollandQuestions,
    ...banks.bigFive,
  ].filter((q) => typeof p.answers[q.id] === "number").length;
  const flags = [];
  if (answered < Math.ceil(coreTotal * 0.8))
    flags.push(
      "部分维度有效回答不足，不显示分数；跳过并不等于不喜欢或能力低。",
    );
  if (
    answered >= 20 &&
    new Set(Object.values(p.answers).filter((v) => v !== null)).size === 1
  )
    flags.push(
      "有效回答都使用同一选项，建议复核是否反映你的真实差异；这不是真实性判断。",
    );
  const growth = p.evidence.flatMap((e, i) =>
    e.status === "some" && (e.support.trim() || e.need.trim())
      ? [{ category: evidenceCategories[i], support: e.support, need: e.need }]
      : [],
  );
  const conditions: string[] = [];
  for (const d of traits) {
    if (d.score === null) continue;
    const high = d.score >= 65,
      low = d.score <= 35;
    if (d.dimension === "E")
      conditions.push(
        high
          ? "可验证条件：主动表达与协作的机会是否让你更投入？"
          : low
            ? "可验证条件：独立准备和安静工作时间是否帮助你发挥？"
            : "可验证条件：尝试独立工作与协作交替的节奏。",
      );
    if (d.dimension === "C")
      conditions.push(
        high
          ? "可验证条件：清晰目标、阶段里程碑和复盘是否有帮助？"
          : "可验证条件：尝试用小步骤、清单和短周期反馈支持推进。",
      );
    if (d.dimension === "O")
      conditions.push(
        high
          ? "可验证条件：允许尝试新方法的空间。"
          : low
            ? "可验证条件：清楚示例和可逐步熟悉的流程。"
            : "可验证条件：稳定基础与适度探索并存。",
      );
    if (d.dimension === "N" && high)
      conditions.push(
        "可验证条件：具体反馈与恢复时间；情绪敏感不等于抗压能力差。",
      );
  }
  const conflicts = [];
  if (p.priorities.includes("稳定安全") && p.priorities.includes("自主空间"))
    conflicts.push("稳定与自主可以并存，但需要分别确认保障条件和决策空间。");
  if (p.priorities.includes("收入回报") && p.priorities.includes("生活平衡"))
    conflicts.push(
      "先写下收入底线与可接受的时间投入，再比较机会，不预设必须牺牲哪一项。",
    );
  const summary =
    evidence.tier === "rich"
      ? `你提供了${evidence.count}段结构较完整的自述。优先回看其中的行动与结果，再验证它们与你对${interestPhrase}的兴趣是否相互支持。`
      : evidence.tier === "some"
        ? `已有一部分具体经历可供对照。你对${interestPhrase}的兴趣仍需在不同情境中验证，不能仅凭一次经历认定能力。`
        : `目前证据信息有限。可从${interestPhrase}和你主动选择的价值诉求出发，优先积累体验，不急着给自己定型。`;
  const directionAdvice = [
    "先试两类不同的小任务，不需要现在就决定未来。",
    "把不想要的内容写成具体条件，同时为尚未体验的活动保留空间。",
    "把大致方向拆成日常任务，再检查你实际喜欢哪些部分。",
    "保留既有目标，检查它需要的任务、条件与现实约束，不用人格否定目标。",
  ][directions.indexOf(p.direction)];
  return {
    version: VERSION,
    interest,
    values,
    traits,
    interestTop,
    valueTop,
    evidence,
    growth,
    conditions,
    conflicts,
    summary,
    directionAdvice,
    flags,
    answered,
    coreTotal,
    next: evidence.next,
    priorities: p.priorities,
  };
}
