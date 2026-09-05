import { hollandQuestions, enneagramQuestions } from "@/lib/instruments";
export default function ModuleCatalog() {
  const modules = [
    {
      name: "职业价值观",
      tag: "基础 01",
      count: "原创40题＋三项取舍",
      time: "约6–10分钟",
      meaning:
        "理解收入、成长、稳定、自主、贡献、平衡、联结与认可的当前优先级。",
      strength: "识别让你愿意坚持的条件，以及需要主动协商的取舍。",
      note: "本项目原创探索题，非施恩原版，不是标准化职业锚量表。",
    },
    {
      name: "霍兰德职业兴趣",
      tag: "基础 02",
      count: `${hollandQuestions.length}题`,
      time: hollandQuestions.length <= 30 ? "约3–5分钟" : "约12–18分钟",
      meaning: "展现现实、研究、艺术、社会、企业与传统六类活动的兴趣倾向。",
      strength: "发现愿意投入的任务和可能发挥优势的情境，再用经历验证。",
      note:
        hollandQuestions.length === 18
          ? "当前为原创18题探索版；90题完整版尚未取得可用题库授权，不冒称已接入。"
          : "依据RIASEC六类兴趣编写的原创探索题，非经典标准量表。兴趣不等于能力。",
    },
    {
      name: "大五人格",
      tag: "基础 03",
      count: "免费50题 / 进阶120题",
      time: "50题约7分钟；120题约15–22分钟",
      meaning: "展现开放性、尽责性、外向性、宜人性与情绪敏感性。",
      strength: "理解组织、协作、应对变化的偏好；高低各有适用情境。",
      note: "120题提供30项细分特质，不是给50题简单追加70题。",
    },
    {
      name: "潜力证据与成长条件",
      tag: "基础 04",
      count: "五类经历 · 行为化追问",
      time: "约8–15分钟；没有经历可明确跳过",
      meaning: "记录具体问题、本人行动、结果、持续过程、反馈与支持条件。",
      strength: "寻找可迁移线索，区分已有自述和待验证假设。",
      note: "只分档信息完整度，不打能力分，不按学历、年级或字数排名。",
    },
    {
      name: "九型人格 / 动机反思",
      tag: "可选 05 · 套餐内",
      count: `原创${enneagramQuestions.length}题`,
      time: "约5–9分钟",
      meaning: "作为选择动机与反应模式的补充反思，不是深层恐惧的确定诊断。",
      strength: "帮助观察一种动机何时有帮助、何时限制选择。",
      note: "本项目原创，非RHETI或经典标准量表；可整项跳过，不影响四维基础画像。",
    },
  ];
  return (
    <section className="module-catalog" aria-label="五个测评模块">
      <div className="section-label">先知道测什么，再开始</div>
      {modules.map((m, i) => (
        <article className="module-row" key={m.name}>
          <div>
            <span className="eyebrow">{m.tag}</span>
            <h2>{m.name}</h2>
            <p className="module-time">
              {m.count}
              <br />
              {m.time}
            </p>
          </div>
          <div>
            <h3>它展现了什么</h3>
            <p>{m.meaning}</p>
            <h3>可以如何帮助你</h3>
            <p>{m.strength}</p>
            <p className="small">{m.note}</p>
          </div>
          <span className="module-number" aria-hidden="true">
            0{i + 1}
          </span>
        </article>
      ))}
      <p className="small">
        以上均为阅读与作答估算，尚待学生试测校准，不是完成时限。基础完整流程预计约
        {hollandQuestions.length > 30 ? "40–65" : "35–55"}
        分钟，可本机保存后分次完成；九型另计。约7分钟仅指免费大五模块。
      </p>
    </section>
  );
}
