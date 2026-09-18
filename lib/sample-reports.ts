// Landing-page sample reports. Pure content config, no database; replace or
// extend with consented real user cases by setting source to "consented" and
// filling consentNote. Tier copy deliberately teaches the evidence-band idea.
// scope "free" mirrors what the free Big-Five tier actually outputs (bars
// only); scope "standard" mirrors the ¥9.9 four-dimension report. School
// names only set the scene for a fictional persona and imply no real student.
export type SampleSource = "sample" | "consented";
export type SampleScope = "free" | "standard";

export interface SampleReport {
  id: string;
  /** Animal avatar file name under public/avatars (Twemoji, CC-BY 4.0). */
  avatar: "fox" | "dog" | "rabbit" | "panda" | "koala" | "tiger";
  scope: SampleScope;
  persona: string;
  tier?: "limited" | "some" | "rich";
  tierLabel?: string;
  tierNote?: string;
  headline: string;
  /** Five dimensions in landing order; scores are 0–100 display scores. */
  bigFive: [string, number][];
  valuesTop?: string[];
  interestTop?: string[];
  hypothesis?: string;
  task?: string;
  source: SampleSource;
  consentNote?: string;
}

export const sampleReports: SampleReport[] = [
  {
    id: "free-nyu-econ",
    scope: "free",
    avatar: "fox",
    persona: "示例 · NYU · 大二 · Economics",
    headline: "免费版先回答一件事：你通常怎么做事。",
    bigFive: [
      ["开放性", 66], ["尽责性", 54], ["外向性", 63], ["宜人性", 57], ["情绪稳定性", 55],
    ],
    source: "sample",
  },
  {
    id: "std-fudan-finance",
    scope: "standard",
    avatar: "dog",
    persona: "示例 · 复旦大学 · 大三 · Finance",
    tier: "some",
    tierLabel: "经历中等",
    tierNote: "已有一两段实习与社团经历。重点是把证据讲完整：具体做了什么、结果如何、谁可以印证。",
    headline: "偏好结构清晰、目标明确的组织型环境；经历中等，先把证据讲成可核验的记录。",
    bigFive: [
      ["开放性", 55], ["尽责性", 71], ["外向性", 58], ["宜人性", 50], ["情绪稳定性", 44],
    ],
    valuesTop: ["收入回报", "稳定安全"],
    interestTop: ["推动", "组织"],
    hypothesis: "在实习中获得的满足感，来自把流程推进落地的过程，而不是头衔或薪资本身。",
    task: "把一段实习的角色、动作和结果整理成一页记录，请带教同事补充一条具体反馈。",
    source: "sample",
  },
  {
    id: "free-manchester-arthistory",
    scope: "free",
    avatar: "rabbit",
    persona: "示例 · Manchester · 大三 · Art History",
    headline: "开放性明显突出；免费版不解释原因，只呈现倾向。",
    bigFive: [
      ["开放性", 82], ["尽责性", 49], ["外向性", 46], ["宜人性", 60], ["情绪稳定性", 58],
    ],
    source: "sample",
  },
  {
    id: "std-tongji-engineering",
    scope: "standard",
    avatar: "panda",
    persona: "示例 · 同济大学 · 大四 · Engineering",
    tier: "some",
    tierLabel: "经历中等",
    tierNote: "已有一两段项目与实习经历。重点是把证据讲完整：具体做了什么、结果如何、谁可以印证。",
    headline: "偏好把事情做扎实的工程环境；已有项目经历，下一步把证据整理成可核验的记录。",
    bigFive: [
      ["开放性", 60], ["尽责性", 73], ["外向性", 52], ["宜人性", 56], ["情绪稳定性", 45],
    ],
    valuesTop: ["稳定安全", "成长精进"],
    interestTop: ["实践", "组织"],
    hypothesis: "在项目中的满足感，来自把设计落地的过程，而不是单纯的技术难度。",
    task: "把一次团队项目的分工、动作和结果整理成一页记录，请两位组员补充反馈。",
    source: "sample",
  },
  {
    id: "std-usc-math",
    scope: "standard",
    avatar: "koala",
    persona: "示例 · USC · 大二 · Math",
    tier: "limited",
    tierLabel: "经历较少",
    tierNote: "五类经历自述较少。报告不会预判潜力，重点是补上第一份可核验的经历。",
    headline: "兴趣指向抽象推理与独立研究；经历还少，先补第一份可验证的经历。",
    bigFive: [
      ["开放性", 69], ["尽责性", 62], ["外向性", 38], ["宜人性", 54], ["情绪稳定性", 52],
    ],
    valuesTop: ["成长精进", "自主空间"],
    interestTop: ["研究", "创意"],
    hypothesis: "对难题的长时投入感，更多来自解题过程本身，而不是成绩反馈。",
    task: "选一个课程之外的小研究问题，独立完成一次书面分析，记录投入感与卡点。",
    source: "sample",
  },
  {
    id: "std-ucl-physics",
    scope: "standard",
    avatar: "tiger",
    persona: "示例 · UCL · 研一 · Physics",
    tier: "rich",
    tierLabel: "经历丰富",
    tierNote: "多段科研与项目经历可以交叉印证。报告的重点转向取舍：哪些方向值得收敛，哪些假设先放下。",
    headline: "研究型兴趣与尽责特质一致；经历充足，重点转向深造与就业之间的方向收敛。",
    bigFive: [
      ["开放性", 74], ["尽责性", 66], ["外向性", 41], ["宜人性", 52], ["情绪稳定性", 47],
    ],
    valuesTop: ["成长精进", "自主空间"],
    interestTop: ["研究", "实践"],
    hypothesis: "更看重研究问题本身的价值，还是稳定可预期的职业路径，需要一次真实取舍来验证。",
    task: "对一个博士申请机会与一份工业界机会各列三条最看重的条件，两周内完成一次倾向排序。",
    source: "sample",
  },
];
