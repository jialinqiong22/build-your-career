export const evidenceCategories = [
  "课程与专业学习",
  "校园项目、竞赛与科研",
  "实习、兼职与志愿服务",
  "社团协作与日常生活",
  "自主学习与技能积累",
] as const;
export const evidenceFields = {
  context: "当时要解决什么具体问题？",
  action: "你本人做了哪些行动，而不是团队做了什么？",
  outcome: "产生了什么结果、作品或变化？未成功也可以。",
  duration: "持续了多久，或经历了哪些迭代？",
  feedback: "结果线索：作品名称、评价内容或如何自行检查（可选）",
  support: "哪些条件帮助了你，例如指导、资源、分工或环境？",
  need: "如果再做一次，你最需要补充什么条件？",
} as const;
export type EvidenceField = keyof typeof evidenceFields;
export type Evidence = { status: "unanswered" | "none" | "some" } & Record<
  EvidenceField,
  string
>;
export function blankEvidence(): Evidence {
  return {
    status: "unanswered",
    context: "",
    action: "",
    outcome: "",
    duration: "",
    feedback: "",
    support: "",
    need: "",
  };
}
const meaningful = (text: string) =>
  text.trim().length > 0 &&
  !/^(无|暂无|没有|不知道|不清楚|还不错|我学习还不错|一般|无所谓|待补充|不适用|[-—.。？?\s]+)$/.test(
    text.trim(),
  );
export function validEvidence(input: unknown): input is Evidence {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const e = input as Evidence;
  return (
    ["unanswered", "none", "some"].includes(e.status) &&
    Object.keys(evidenceFields).every(
      (key) =>
        typeof e[key as EvidenceField] === "string" &&
        e[key as EvidenceField].length <= 400,
    )
  );
}
export function evidenceBand(entries: readonly Evidence[]) {
  const seen = new Set<string>();
  const records = entries.map((e, index) => {
    const core = [e.context, e.action, e.outcome, e.duration].map((t) =>
      t.trim(),
    );
    const fingerprint = core.join("|").replace(/\s+/g, "");
    const distinct = new Set(core.filter(meaningful)).size;
    const structured =
      e.status === "some" &&
      core.every(meaningful) &&
      distinct >= 3 &&
      !seen.has(fingerprint);
    if (structured) seen.add(fingerprint);
    return {
      index,
      structured,
      traceable: structured && meaningful(e.feedback),
      growth: meaningful(e.support) || meaningful(e.need),
    };
  });
  const count = records.filter((r) => r.structured).length;
  const traceable = records.filter((r) => r.traceable).length;
  const tier =
    count >= 2 && traceable >= 1 ? "rich" : count >= 1 ? "some" : "limited";
  const messages = {
    limited: {
      label: "证据信息较少",
      guidance:
        "目前经历信息有限。以下兴趣和价值观只是探索假设，先用一次小任务积累行动记录，不据此推断能力。",
      next: "选择一个感兴趣的小任务，记录问题、本人行动、结果与持续过程；没有实习经历也可以从课程或生活开始。",
    },
    some: {
      label: "已有一些具体信息",
      guidance:
        "将你的偏好与这段经历对照，区分自述支持和仍待验证的假设。一次经历不代表跨情境的稳定能力。",
      next: "在另一个情境重复一项相关任务，保留产出并记录反馈，观察是否仍然愿意投入、哪些支持条件不可缺少。",
    },
    rich: {
      label: "证据信息较丰富",
      guidance:
        "优先回看已有行动与结果线索，再用兴趣和价值观解释投入与取舍。信息丰富不等于能力更强，内容仍未外部核验。",
      next: "比较两段经历：哪些行动可迁移，哪些结果依赖指导、资源或分工？选一个支持条件较少的新场景验证边界。",
    },
  };
  return {
    tier,
    ...messages[tier],
    count,
    traceable,
    records,
    rule: "分档仅依据情境、行动、结果、过程字段及结果线索的填写情况；重复记录不重复计数。不按字数、学历、年级或方向清晰度排名，不验证真实性。",
  };
}
