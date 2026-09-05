export const VERSION = "2.0-exploration";
export const KEY = "career-positioning-v2";
export const stages = ["本科在读", "硕士在读", "本科应届", "硕士应届"];
export const directions = [
  "还没有方向",
  "知道不想要什么",
  "有大致方向",
  "已有明确目标",
];
export const values = [
  "成长精进",
  "收入回报",
  "稳定安全",
  "自主空间",
  "社会贡献",
  "生活平衡",
  "团队联结",
  "认可影响",
];
export const evidenceNames = [
  "分析与研究",
  "创造与表达",
  "协作与支持",
  "组织与执行",
];
export const evidenceLevels = [
  "还没有相关经历",
  "尝试过",
  "完成了具体产出",
  "产出获得过反馈",
];
export type Question = {
  id: string;
  dimension: string;
  text: string;
  reverse?: boolean;
};
export const interestNames: Record<string, string> = {
  R: "动手实践",
  I: "研究分析",
  A: "创意表达",
  S: "帮助支持",
  E: "影响推动",
  C: "条理组织",
};
export const traitNames: Record<string, string> = {
  O: "开放探索",
  C: "计划自律",
  E: "社交活跃",
  A: "合作体谅",
  N: "情绪敏感",
};
const interestItems: Record<string, string[]> = {
  R: [
    "亲手组装、修理或制作一件东西。",
    "操作器材，在真实场景中解决具体问题。",
    "通过实地观察和动手试验学习。",
  ],
  I: [
    "查找资料，弄清一个现象背后的原因。",
    "比较数据或证据，检验自己的猜想。",
    "围绕一个复杂问题持续研究。",
  ],
  A: [
    "写作、设计或创作，表达自己的想法。",
    "为同一个问题想出不同的解决方案。",
    "尝试没有固定答案的创作任务。",
  ],
  S: [
    "帮助别人理解一项知识或技能。",
    "倾听他人的困惑并提供支持。",
    "参与对他人有直接帮助的服务活动。",
  ],
  E: [
    "向别人介绍一个想法，争取他们支持。",
    "发起一项活动并协调资源推进。",
    "通过交流和谈判推动共同决定。",
  ],
  C: [
    "整理信息，让资料清晰且容易查找。",
    "核对细节，发现遗漏或不一致。",
    "制定流程，让重复任务更有条理。",
  ],
};
const traitItems: Record<string, [string, boolean?][]> = {
  O: [
    ["我常主动接触不熟悉的观点或领域。"],
    ["遇到不同解法，我愿意尝试新方法。"],
    ["即使有机会，我也很少探索熟悉范围之外的内容。", true],
  ],
  C: [
    ["我会把任务拆成步骤并跟进进度。"],
    ["没有人提醒时，我也会努力履行约定。"],
    ["我经常拖到最后才开始重要任务。", true],
  ],
  E: [
    ["与一群人交流后，我通常更有精神。"],
    ["在不熟悉的群体里，我常主动开口。"],
    ["持续社交后，我通常很需要独处恢复。", true],
  ],
  A: [
    ["意见冲突时，我会先理解对方的处境。"],
    ["合作时，我愿意照顾别人的实际困难。"],
    ["讨论问题时，我很少考虑表达方式是否影响别人。", true],
  ],
  N: [
    ["遇到不确定的结果，我容易反复担心。"],
    ["负面反馈常让我较长时间难以平静。"],
    ["事情出错后，我通常能较快恢复平稳。", true],
  ],
};
export const interests: Question[] = Object.entries(interestItems).flatMap(
  ([dimension, items]) =>
    items.map((text, i) => ({ id: `i${dimension}${i}`, dimension, text })),
);
export const traits: Question[] = Object.entries(traitItems).flatMap(
  ([dimension, items]) =>
    items.map(([text, reverse], i) => ({
      id: `t${dimension}${i}`,
      dimension,
      text,
      reverse,
    })),
);
export type Profile = {
  version: string;
  stage: string;
  direction: string;
  target: string;
  answers: Record<string, number | null>;
  priorities: string[];
  evidence: { level: number; text: string }[];
};
export function blank(): Profile {
  return {
    version: VERSION,
    stage: stages[0],
    direction: directions[0],
    target: "",
    answers: {},
    priorities: [],
    evidence: evidenceNames.map(() => ({ level: 0, text: "" })),
  };
}
export function validProfile(input: unknown): input is Profile {
  if (!input || typeof input !== "object") return false;
  const p = input as Profile;
  if (
    p.version !== VERSION ||
    !stages.includes(p.stage) ||
    !directions.includes(p.direction) ||
    typeof p.target !== "string" ||
    p.target.length > 200
  )
    return false;
  if (!p.answers || typeof p.answers !== "object" || Array.isArray(p.answers))
    return false;
  const ids = new Set([...interests, ...traits].map((q) => q.id));
  if (
    !Object.entries(p.answers).every(
      ([k, v]) =>
        ids.has(k) &&
        (v === null || (Number.isInteger(v) && v! >= 1 && v! <= 5)),
    )
  )
    return false;
  if (
    !Array.isArray(p.priorities) ||
    p.priorities.length > 3 ||
    new Set(p.priorities).size !== p.priorities.length ||
    !p.priorities.every((v) => values.includes(v))
  )
    return false;
  return (
    Array.isArray(p.evidence) &&
    p.evidence.length === 4 &&
    p.evidence.every(
      (e) =>
        e &&
        Number.isInteger(e.level) &&
        e.level >= 0 &&
        e.level <= 3 &&
        typeof e.text === "string" &&
        e.text.length <= 600,
    )
  );
}
export function score(questions: Question[], answers: Profile["answers"]) {
  return [...new Set(questions.map((q) => q.dimension))].map((dimension) => {
    const samples = questions
      .filter((q) => q.dimension === dimension)
      .flatMap((q) => {
        const n = answers[q.id];
        return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5
          ? [q.reverse ? 6 - n : n]
          : [];
      });
    return {
      dimension,
      answered: samples.length,
      score:
        samples.length >= 2
          ? Math.round(
              (samples.reduce((a, b) => a + b, 0) / samples.length - 1) * 25,
            )
          : null,
    };
  });
}
export function finished(p: Profile) {
  return (
    [...interests, ...traits].every((q) => Object.hasOwn(p.answers, q.id)) &&
    p.priorities.length === 3 &&
    p.evidence.every((e) => e.level === 0 || e.text.trim().length >= 12)
  );
}
export const activities: Record<
  string,
  { text: string; task: string; evidence: number }
> = {
  R: {
    text: "把想法做成可观察的实物或实验",
    task: "选一件生活中的小问题，制作一个模型或完成一次实际改进，记录过程、失败和结果。",
    evidence: 1,
  },
  I: {
    text: "通过资料和证据理清复杂问题",
    task: "选择一个好奇的问题，比较3个可靠来源，写一页分析，区分事实、推测和未解决的问题。",
    evidence: 0,
  },
  A: {
    text: "将观察和想法转化成表达或方案",
    task: "围绕一个主题做一件作品，向2个人收集具体反馈，再修改一次并记录取舍。",
    evidence: 1,
  },
  S: {
    text: "通过倾听、讲解和支持帮助他人",
    task: "征得一位同学同意，帮助其解决一个学习困难，准备材料并询问哪些帮助真正有效。",
    evidence: 2,
  },
  E: {
    text: "争取支持并推动共同决定",
    task: "邀请同学一起完成一个小活动，提出方案、分配任务，并记录你如何处理不同意见。",
    evidence: 2,
  },
  C: {
    text: "组织信息、检查细节并推动有序执行",
    task: "为一项学习任务设计清单或整理系统，实际使用3天，记录节省的时间和需要改进的地方。",
    evidence: 3,
  },
};
export function report(p: Profile) {
  const interest = score(interests, p.answers),
    trait = score(traits, p.answers);
  const sorted = interest
    .filter((x) => x.score !== null)
    .sort((a, b) => b.score! - a.score!);
  const top = sorted.filter((x) => sorted[0].score! - x.score! <= 8);
  const leading =
    top.length > 0 && top.length <= 3 && top[0].score! >= 50 ? top : [];
  const traitValue = (id: string) =>
    trait.find((x) => x.dimension === id)?.score;
  const environments: string[] = [];
  const e = traitValue("E"),
    o = traitValue("O"),
    c = traitValue("C"),
    n = traitValue("N"),
    a = traitValue("A");
  if (e != null)
    environments.push(
      e >= 65
        ? "交流和协作机会较多，但仍需观察真实社交负荷。"
        : e <= 35
          ? "有独立准备和安静专注的空间。"
          : "独立工作与协作交替，可试着寻找合适比例。",
    );
  if (o != null)
    environments.push(
      o >= 65
        ? "允许探索新方法，能接触不同问题。"
        : o <= 35
          ? "有熟悉流程和清楚示例，逐步接触变化。"
          : "在明确基础上保留一定尝试空间。",
    );
  if (c != null)
    environments.push(
      c >= 65
        ? "有明确目标、阶段成果和可跟踪进度。"
        : "借助清单和短周期反馈，观察哪种结构最有帮助。",
    );
  if (n != null && n >= 65)
    environments.push(
      "反馈具体且可行动，工作节奏有恢复空间；这不代表你抗压能力差。",
    );
  if (a != null && a >= 65)
    environments.push("重视相互尊重，同时允许明确表达边界与不同意见。");
  const flags: string[] = [];
  const answered = Object.values(p.answers).filter(
    (v): v is number => typeof v === "number",
  );
  if (answered.length < 26)
    flags.push("部分维度信息有限，未显示的维度需要更多体验或回答。");
  if (answered.length >= 15 && new Set(answered).size === 1)
    flags.push(
      "所有有效题使用了同一选项，建议重新确认；这并不证明回答不真实。",
    );
  for (const d of Object.keys(traitNames)) {
    const qs = traits.filter((q) => q.dimension === d),
      f = p.answers[qs[0].id],
      r = p.answers[qs[2].id];
    if (
      typeof f === "number" &&
      typeof r === "number" &&
      Math.abs(f - (6 - r)) >= 3
    )
      flags.push(
        `${traitNames[d]}相关回答存在差异，可以结合具体情境重新理解。`,
      );
  }
  if (p.evidence.every((e) => e.level === 0))
    flags.push("暂时没有行为经历支持；兴趣倾向不能直接等同于能力。");
  const conflicts: string[] = [];
  if (p.priorities.includes("稳定安全") && p.priorities.includes("自主空间"))
    conflicts.push(
      "你同时重视稳定和自主。比较机会时，分别确认保障条件与决策空间，避免假设两者必然同时满足。",
    );
  if (p.priorities.includes("收入回报") && p.priorities.includes("生活平衡"))
    conflicts.push(
      "收入与生活平衡都重要。先写下收入底线和可接受的时间投入，再比较具体机会。",
    );
  if (o != null && o >= 65 && p.priorities.includes("稳定安全"))
    conflicts.push(
      "喜欢探索与需要安全感可以并存：有保障的环境内，也可以寻找新问题。",
    );
  return {
    interest,
    trait,
    leading,
    environments,
    flags,
    conflicts,
    answered: answered.length,
    summary: leading.length
      ? `你目前更愿意接触${leading.map((x) => interestNames[x.dimension]).join("、")}类活动，选择机会时尤其看重${p.priorities.slice(0, 2).join("与")}。这些是值得通过经历验证的线索。`
      : "目前兴趣尚未形成明显区分。可以先从价值优先级出发，比较不同活动的真实体验，不必急着给自己定型。",
    task: leading.length
      ? activities[leading[0].dimension].task
      : "从研究一个问题、创作一件作品、帮助一个人中任选两项，各尝试30分钟，记录投入感、困难与是否愿意继续。",
  };
}
