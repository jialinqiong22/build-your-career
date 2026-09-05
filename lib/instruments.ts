/** Original exploration items, not a licensed Holland/SDS standard inventory. */
export interface InstrumentQuestion {
  id: string;
  text: string;
  dimension: string;
  reverse?: boolean;
  sourceEnglish?: string;
}

export const hollandNames: Record<string, string> = {
  R: "动手实践",
  I: "研究分析",
  A: "创意表达",
  S: "帮助支持",
  E: "影响推动",
  C: "条理组织",
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
export const hollandQuestions: readonly InstrumentQuestion[] = Object.entries(
  interestItems,
).flatMap(([dimension, items]) =>
  items.map((text, i) => ({ id: `i${dimension}${i}`, text, dimension })),
);
export type Interpretation = {
  meaning: string;
  strength: string;
  tradeoff: string;
};
export const hollandDescriptions: Record<string, Interpretation> = {
  R: {
    meaning: "你可能更愿意接触实物、工具和具体场景。",
    strength: "可优先尝试动手制作、现场观察等任务，检验实践解决问题的潜力。",
    tradeoff: "兴趣不等于已经掌握操作技能；需要训练和安全条件。",
  },
  I: {
    meaning: "你可能享受追问原因、比较证据和理解复杂问题。",
    strength: "可在资料研究、实验或数据解释中验证分析潜力。",
    tradeoff: "同时练习在信息不完整时给出暂定判断，避免研究无限延长。",
  },
  A: {
    meaning: "你可能喜欢表达想法、探索多种方案及开放式创作。",
    strength: "可用作品或原型检验创意表达的潜力。",
    tradeoff: "实际任务也需要考虑受众、反馈与交付边界。",
  },
  S: {
    meaning: "你可能愿意理解他人、传授知识并提供帮助。",
    strength: "可通过辅导、志愿服务或协作任务验证支持他人的潜力。",
    tradeoff: "关注自己的边界，愿意帮助不等于必须承担所有需求。",
  },
  E: {
    meaning: "你可能喜欢发起事情、争取支持和推动共同决定。",
    strength: "可通过活动发起、提案或协商验证影响推动的潜力。",
    tradeoff: "推进时也需听取异议；表达积极不等于已有管理能力。",
  },
  C: {
    meaning: "你可能偏好清晰的信息、准确的细节和有序的流程。",
    strength: "可用资料整理、质量核对或流程改进验证组织潜力。",
    tradeoff: "条件变化时需要调整流程，避免为维持秩序忽略实际目标。",
  },
};

// Original reflective prompts approved for this product; not RHETI or OEPS.
const motivationItems: Record<string, string[]> = {
  "1": [
    "选择做法时，我希望自己能清楚说明它符合什么原则。",
    "即使没有人检查，我也会想把结果调整到自己认可的标准。",
    "发现流程中的不合理之处时，我会产生推动改进的念头。",
    "面对一个差不多能用的方案，我仍会在意哪些地方可以更妥当。",
  ],
  "2": [
    "知道自己的付出让别人轻松一些，会让我更愿意继续投入。",
    "选择参加活动时，我会在意自己能否与参与者建立联系。",
    "别人愿意向我求助，会让我感到自己在这段关系中有价值。",
    "和只完成自己的部分相比，我常常还想了解同伴需要什么支持。",
  ],
  "3": [
    "能够看见阶段性成果，会明显增加我继续做一件事的动力。",
    "选择任务时，我会关注它能否体现自己的进步和贡献。",
    "得到他人对成果的肯定，会促使我争取下一个目标。",
    "当目标和衡量结果的标准明确时，我更容易集中精力。",
  ],
  "4": [
    "决定参与什么事情时，我在意它是否表达了真实的自己。",
    "比起采用大家都在用的表达，我更想找到自己的表达方式。",
    "一件事能否承载对我有意义的感受，会影响我的投入程度。",
    "即使一个选择很受欢迎，我也会先想它是否与我自己的体验契合。",
  ],
  "5": [
    "遇到新的任务时，先理解它如何运作会让我更愿意参与。",
    "能够留出不被打扰的思考时间，是我选择做事方式的重要考虑。",
    "相比立刻发表意见，我通常更想先建立自己的理解。",
    "积累足够的信息和方法后，我更愿意独立承担一项任务。",
  ],
  "6": [
    "开始一件重要的事情前，我希望知道遇到问题可以向谁求助。",
    "能确认承诺和规则是否可靠，会帮助我决定是否投入。",
    "做选择时，我会主动考虑如果事情不如预期该怎么办。",
    "与经过相处而建立信任的人合作，会让我更有行动动力。",
  ],
  "7": [
    "一件事包含新的体验或尝试空间时，我会更想参与。",
    "做计划时，保留几种可能性会让我感到更有动力。",
    "遇到不顺利的事情时，我常会想还有哪些有趣的替代方案。",
    "能够接触不同主题和活动，是我持续投入的重要原因。",
  ],
  "8": [
    "能否对自己的行动作决定，是我选择参与方式的重要考虑。",
    "当我认为自己的边界被忽视时，我会想直接说明立场。",
    "看到团队成员受到不公平对待时，我会产生出面支持的念头。",
    "比起等待别人决定，我更愿意明确自己愿意负责的部分并行动。",
  ],
  "9": [
    "做共同决定时，我希望不同人的意见都有被听见的机会。",
    "一个相处平和的环境，会增加我参与和持续投入的意愿。",
    "面对分歧时，我常会先寻找大家能够接受的共同点。",
    "当各方安排可以协调起来时，我会感到事情更值得推进。",
  ],
};
// Interleave types so adjacent prompts do not repeat the same theme.
export const enneagramQuestions: readonly InstrumentQuestion[] = Array.from(
  { length: 4 },
  (_, index) =>
    Object.entries(motivationItems).map(([dimension, items]) => ({
      id: `en${dimension}_${index + 1}`,
      text: items[index],
      dimension,
    })),
).flat();
export const enneagramNames: Record<string, string> = {
  "1": "原则与改进",
  "2": "关系与帮助",
  "3": "成就与认可",
  "4": "独特与表达",
  "5": "理解与独立",
  "6": "安全与信任",
  "7": "可能性与体验",
  "8": "自主与保护",
  "9": "和谐与协调",
};
// Original reflection prompts: these are not psychometric findings or diagnoses.
export const enneagramDescriptions: Record<string, Interpretation> = {
  "1": {
    meaning: "如果你认同这一描述，可以反思自己对标准与正确性的重视。",
    strength: "这种关注有时有助于发现可改进之处。",
    tradeoff: "可以问自己：什么程度已经足够好？",
  },
  "2": {
    meaning: "如果你认同这一描述，可以反思被需要和建立关系对你的意义。",
    strength: "这种关注有时有助于主动支持他人。",
    tradeoff: "可以问自己：我是否明确表达了自己的需要？",
  },
  "3": {
    meaning: "如果你认同这一描述，可以反思成果与外部认可对选择的影响。",
    strength: "这种关注有时有助于持续推进目标。",
    tradeoff: "可以问自己：没有外部评价时，我还愿意做什么？",
  },
  "4": {
    meaning: "如果你认同这一描述，可以反思真实表达和独特体验的重要性。",
    strength: "这种关注有时有助于呈现不同的视角。",
    tradeoff: "可以问自己：怎样把感受变成可交流的作品或行动？",
  },
  "5": {
    meaning: "如果你认同这一描述，可以反思理解事物和保留独立空间的需要。",
    strength: "这种关注有时有助于深入学习。",
    tradeoff: "可以问自己：何时值得用一次小行动代替继续准备？",
  },
  "6": {
    meaning: "如果你认同这一描述，可以反思确定性与可靠支持的重要性。",
    strength: "这种关注有时有助于提前发现风险。",
    tradeoff: "可以问自己：哪些风险可用小规模尝试来了解？",
  },
  "7": {
    meaning: "如果你认同这一描述，可以反思新体验和选择空间的吸引力。",
    strength: "这种关注有时有助于寻找新可能。",
    tradeoff: "可以问自己：哪一件事值得坚持到产生结果？",
  },
  "8": {
    meaning: "如果你认同这一描述，可以反思自主决定和保护边界的需要。",
    strength: "这种关注有时有助于明确立场和采取行动。",
    tradeoff: "可以问自己：我是否给别人留下了表达不同意见的空间？",
  },
  "9": {
    meaning: "如果你认同这一描述，可以反思和谐关系与避免冲突对选择的影响。",
    strength: "这种关注有时有助于倾听不同立场。",
    tradeoff: "可以问自己：这次我自己真正希望什么？",
  },
};

export const instrumentMetadata = {
  holland: {
    title: "霍兰德职业兴趣 · 原创探索版",
    count: hollandQuestions.length,
    minutes: "3–5分钟",
    source: "本项目原创18题，参考RIASEC六类兴趣框架",
    status: "original-exploratory",
    notice:
      "不是霍兰德90题标准完整版，尚未完成心理测量验证；结果表示自述兴趣，不表示能力。",
  },
  enneagram: {
    title: "九型人格 · 原创动机反思",
    count: enneagramQuestions.length,
    minutes: "5–7分钟",
    source: "本项目原创36题，不是RHETI或OEPS经典量表",
    status: "original-exploratory",
    notice:
      "未经心理测量验证，仅供自我反思；分数表示对这些描述的认同程度，不认定人格类型，不参与核心画像。",
    externalUrl: "https://enneagram-personality.com/zh-Hans",
  },
} as const;

/** Linear response intensity, not a population percentile or ability score. */
export function scoreInstrument(
  questions: readonly InstrumentQuestion[],
  answers: Record<string, number | null>,
  minCoverage = 0.8,
) {
  if (!Number.isFinite(minCoverage) || minCoverage <= 0 || minCoverage > 1)
    throw new RangeError("minCoverage must be in (0, 1]");
  return [...new Set(questions.map((q) => q.dimension))].map((dimension) => {
    const items = questions.filter((q) => q.dimension === dimension);
    const valid = items.flatMap((q) => {
      const value = Object.hasOwn(answers, q.id) ? answers[q.id] : null;
      return typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= 5
        ? [q.reverse ? 6 - value : value]
        : [];
    });
    return {
      dimension,
      answered: valid.length,
      expected: items.length,
      score:
        valid.length >= Math.ceil(items.length * minCoverage)
          ? Math.round(
              (valid.reduce((a, b) => a + b, 0) / valid.length - 1) * 25,
            )
          : null,
    };
  });
}
