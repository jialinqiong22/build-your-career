/**
 * Original student-facing work-values reflection bank, version 1.
 * Not Schein's Career Anchors, Super's WVI, or a validated standard scale.
 * Prompt: “选择未来的学习、项目或工作机会时，以下条件对你有多重要？”
 * Responses: 1 = 不重要, 2 = 较不重要, 3 = 一般, 4 = 比较重要, 5 = 非常重要.
 * Users may skip unfamiliar situations. Scores describe stated priorities,
 * not ability, virtue, persistence, population percentiles or job fit.
 */
export const valueNames = [
  "成长精进",
  "收入回报",
  "稳定安全",
  "自主空间",
  "社会贡献",
  "生活平衡",
  "团队联结",
  "认可影响",
] as const;

export type ValueDimension = (typeof valueNames)[number];
export type ValueQuestion = {
  id: string;
  text: string;
  dimension: ValueDimension;
};

const items: Record<ValueDimension, readonly string[]> = {
  成长精进: [
    "任务完成后，有人能指出我具体可以改进的地方。",
    "一段项目或工作结束时，我能掌握之前不会的方法或技能。",
    "日常安排中留有学习和练习的时间，而不只是赶交付。",
    "遇到难题时，我有机会向经验更丰富的人请教。",
    "我可以沿着自己感兴趣的问题持续深入，而不总停留在入门阶段。",
  ],
  收入回报: [
    "获得的报酬足以覆盖我计划承担的生活开支。",
    "在投入额外时间前，我能知道是否有对应的补偿。",
    "选择机会时，能明确了解报酬的金额、构成和发放条件。",
    "随着我承担更难的任务，报酬也有相应提高的空间。",
    "扣除通勤、住宿等必要支出后，我仍能留下用于储蓄或个人计划的钱。",
  ],
  稳定安全: [
    "开始一段实习或工作前，能明确知道它预计持续多久。",
    "对方能按约定的时间提供报酬或已承诺的支持。",
    "任务安排或合作规则发生调整时，我能提前得到通知。",
    "即使外部情况变化，我的日常生活也不至于突然失去基本保障。",
    "参与之前，我能清楚了解责任边界，以及遇到问题时的处理渠道。",
  ],
  自主空间: [
    "目标明确后，我可以自己选择完成任务的方法。",
    "我有权对不合理的临时要求提出不同意见。",
    "在不影响约定交付的前提下，我能自行安排任务顺序。",
    "我可以提出并尝试自己的方案，而不必每一步都照着模板做。",
    "接到任务时，我能参与商定范围，而不只是被动接受安排。",
  ],
  社会贡献: [
    "我能看见自己的成果为某一类人解决了具体问题。",
    "选择参与的项目时，其产生的影响与我关心的公共议题有关。",
    "即使不直接接触使用者，我也能了解成果最终帮助了谁。",
    "发现方案可能给他人带来不便或伤害时，有空间推动调整。",
    "我的投入能改善一些人获得资源或机会的条件。",
  ],
  生活平衡: [
    "学习或工作之外，我能提前安排并保留个人时间。",
    "忙碌阶段结束后，有实际的休息和恢复机会。",
    "日常时间安排允许我兼顾重要的家庭或照护责任。",
    "通勤和任务占用的时间，不会长期挤掉睡眠与基本生活。",
    "在约定的休息时间，我不需要持续等待消息或随时回应。",
  ],
  团队联结: [
    "遇到不懂的问题时，身边的人愿意交流而不会让我难堪。",
    "合作伙伴之间能坦诚说明进度和困难。",
    "除了分配任务，团队也会安排互相交流和了解的机会。",
    "出现分歧时，大家愿意听完彼此的理由再作决定。",
    "完成任务的过程中，我能与一些伙伴建立持续的信任关系。",
  ],
  认可影响: [
    "我的实际贡献能被看见，并在总结成果时得到明确说明。",
    "涉及我负责的事情时，我有机会参与重要决定。",
    "我提出的建议有机会改变团队后续的做法。",
    "完成有价值的成果后，我有机会向更多人展示或介绍它。",
    "在逐渐积累经验后，我能获得更大的责任和相应的话语权。",
  ],
};

// Interleave dimensions so that adjacent questions do not reveal one category.
export const valueQuestions: readonly ValueQuestion[] = Array.from(
  { length: 5 },
  (_, itemIndex) =>
    valueNames.map((dimension, dimensionIndex) => ({
      id: `values-${dimensionIndex + 1}-${itemIndex + 1}`,
      text: items[dimension][itemIndex],
      dimension,
    })),
).flat();

export const valueDescriptions: Record<
  ValueDimension,
  {
    meaning: string;
    strength: string;
    tradeoff: string;
  }
> = {
  成长精进: {
    meaning: "关注反馈、学习支持和持续积累的机会。",
    strength:
      "在有练习与反馈的环境中，可能更愿意持续投入；这不是学习能力的证明。",
    tradeoff: "需核实真实的学习资源，区分成长机会与只有忙碌、没有指导的任务。",
  },
  收入回报: {
    meaning: "关注经济回报能否支持生活需要及个人计划。",
    strength: "可能更重视投入与回报的边界，有助于明确机会选择中的经济底线。",
    tradeoff: "可把最低可接受回报与理想回报分开，同时考虑必要支出和时间成本。",
  },
  稳定安全: {
    meaning: "关注承诺可靠、规则清楚和生活安排的可预期性。",
    strength: "明确的保障和规则可能帮助你安心投入；这不意味着你不能应对变化。",
    tradeoff: "稳定并非完全没有变化，可明确自己能接受哪些变化、需要哪些缓冲。",
  },
  自主空间: {
    meaning: "关注方法选择、安排空间以及协商任务边界的机会。",
    strength:
      "有一定决定空间时，可能更愿意提出方案并承担责任；不等于已经能独立胜任。",
    tradeoff: "自主通常仍有交付约束，可确认哪些事项能自己决定、哪些需要协调。",
  },
  社会贡献: {
    meaning: "关注成果对他人及自己关心的社会问题产生的影响。",
    strength: "看见具体受益者和改善结果，可能为你提供持续投入的理由。",
    tradeoff:
      "需要核实实际影响，而不只看使命宣传；重视其他价值也不代表缺乏善意。",
  },
  生活平衡: {
    meaning: "关注恢复时间、个人安排以及工作学习以外的重要责任。",
    strength: "可能更清楚可持续投入所需要的生活条件；不能据此推断努力程度。",
    tradeoff: "可区分短期可接受的忙碌与长期不能接受的节奏，并确认休息边界。",
  },
  团队联结: {
    meaning: "关注合作中的信任、尊重和相互支持。",
    strength:
      "支持性的关系可能帮助你提问和交流；这并不是沟通能力或外向程度分数。",
    tradeoff:
      "友好的氛围也需要清晰分工，可留意关系融洽与任务规则是否同时存在。",
  },
  认可影响: {
    meaning: "关注贡献被看见，以及参与决策、推动改变的空间。",
    strength: "有表达与影响机会时，可能更有投入意愿；这不直接证明领导能力。",
    tradeoff: "可进一步区分你想要的是成果署名、公开认可，还是实际决策权。",
  },
};

export function scoreValues(answers: Record<string, number | null>): {
  dimension: ValueDimension;
  answered: number;
  expected: number;
  score: number | null;
}[] {
  return valueNames.map((dimension) => {
    const valid = valueQuestions
      .filter((question) => question.dimension === dimension)
      .map((question) => answers[question.id])
      .filter(
        (answer): answer is number =>
          typeof answer === "number" &&
          Number.isInteger(answer) &&
          answer >= 1 &&
          answer <= 5,
      );
    return {
      dimension,
      answered: valid.length,
      expected: 5,
      score:
        valid.length >= 4
          ? Math.round(
              ((valid.reduce((sum, value) => sum + value, 0) / valid.length -
                1) /
                4) *
                100,
            )
          : null,
    };
  });
}
