import BigFiveResults from "./BigFiveResults";
import { report, type Profile, type SuiteBanks } from "@/lib/positioning";
import { valueDescriptions } from "@/lib/values";
import {
  hollandNames,
  hollandDescriptions,
  enneagramNames,
  enneagramDescriptions,
  scoreInstrument,
} from "@/lib/instruments";
import {
  evidenceCategories,
  evidenceFields,
  type EvidenceField,
} from "@/lib/evidence";
type Result = ReturnType<typeof report>;
function Scores({
  scores,
  names,
}: {
  scores: {
    dimension: string;
    score: number | null;
    answered: number;
    expected: number;
  }[];
  names?: Record<string, string>;
}) {
  return (
    <div className="bars">
      {scores.map((d) => (
        <div className="bar" key={d.dimension}>
          <div>
            <span>{names?.[d.dimension] || d.dimension}</span>
            <span>{d.score === null ? "信息不足" : `${d.score} / 100`}</span>
          </div>
          <div className="track">
            <span style={{ width: `${d.score ?? 0}%` }} />
          </div>
          <small>
            有效回答 {d.answered}/{d.expected}
          </small>
        </div>
      ))}
    </div>
  );
}
export default function SuiteReport({
  profile: p,
  banks,
  result: r,
}: {
  profile: Profile;
  banks: SuiteBanks;
  result: Result;
}) {
  const optional =
    p.enneagramChoice === "take"
      ? scoreInstrument(banks.enneagram, p.enneagramAnswers)
      : [];
  const highest = Math.max(
    ...optional.filter((x) => x.score !== null).map((x) => x.score!),
  );
  const motive = optional.filter(
    (x) => x.score !== null && highest - x.score <= 8,
  );
  return (
    <div className="report">
      <header className="report-heading">
        <span className="eyebrow">PERSONAL PORTRAIT / {r.version}</span>
        <h1>你的个人定位画像</h1>
        <p>
          {p.stage} · {p.direction}
        </p>
      </header>
      <section className="summary">
        <span className="eyebrow">先读这里 / 四维分开看</span>
        <h2>{r.summary}</h2>
        <p>{r.directionAdvice}</p>
        <p>
          本报告没有个人定位总分、固定权重或岗位匹配百分比。偏好、经历和动机不能互相替代。
        </p>
      </section>
      <section className="report-card">
        <span className="eyebrow">01 / 职业价值观 · 原创40题</span>
        <h2>什么值得你长期投入</h2>
        <p>
          分数反映当前重要程度，不是道德高低，也不代表满足后一定成功。本项目原创探索题，非施恩原版、非标准化职业锚量表。
        </p>
        <Scores scores={r.values} />
        <h3>你主动选择的取舍顺序</h3>
        <p>{p.priorities.join(" → ")}</p>
        <p className="small">
          问卷分数和主动排序可以不同：前者描述重要程度，后者帮助你在不能兼得时取舍，不强制修改其中任何一个。
        </p>
        {p.priorities.map((v) => (
          <div className="insight" key={v}>
            <strong>{v}</strong>
            <p>{valueDescriptions[v]?.meaning}</p>
            <p>可能的优势情境：{valueDescriptions[v]?.strength}</p>
            <p>需要留意：{valueDescriptions[v]?.tradeoff}</p>
          </div>
        ))}
        {r.conflicts.map((x) => (
          <p key={x}>{x}</p>
        ))}
      </section>
      <section className="report-card">
        <span className="eyebrow">02 / 霍兰德职业兴趣</span>
        <h2>什么让你愿意靠近</h2>
        <Scores scores={r.interest} names={hollandNames} />
        <p>
          {r.interestTop.length
            ? `当前接近的兴趣线索：${r.interestTop.map((x) => x.dimension).join(" / ")}。接近分数并列解读，不强行确定唯一职业。`
            : "本次兴趣尚未明显分化，或有效信息不足；不强行生成三字母代码。"}
        </p>
        {r.interestTop.map((d) => (
          <div className="insight" key={d.dimension}>
            <h3>{hollandNames[d.dimension]}</h3>
            <p>{hollandDescriptions[d.dimension]?.meaning}</p>
            <p>
              值得验证的优势情境：{hollandDescriptions[d.dimension]?.strength}
            </p>
            <p>{hollandDescriptions[d.dimension]?.tradeoff}</p>
          </div>
        ))}
        <p className="small">
          兴趣高分不等于擅长。这里不推荐岗位、不预测薪资；尚未经历的任务可以先体验再判断。
        </p>
      </section>
      <section className="report-card">
        <span className="eyebrow">03 / 大五人格</span>
        <h2>你通常如何做事</h2>
        <p>
          高低都有适用情境。组织习惯、协作方式、变化偏好和情绪反应不是个人价值排名。
        </p>
      </section>
      <BigFiveResults items={banks.bigFive} answers={p.answers} />
      <section className="report-card">
        <span className="eyebrow">04 / 潜力证据与成长条件</span>
        <h2>{r.evidence.label}</h2>
        <p>{r.evidence.guidance}</p>
        <p className="small">
          {r.evidence.rule} 较完整记录 {r.evidence.count} 段；带结果线索{" "}
          {r.evidence.traceable}{" "}
          段。这里只是自述完整度，不是证据真伪或能力等级。
        </p>
        {p.evidence.map((e, i) => (
          <div className="evidence-record" key={i}>
            <h3>{evidenceCategories[i]}</h3>
            {e.status === "none" ? (
              <p>暂未提供经历，不代表缺少能力。</p>
            ) : (
              <>
                <p className="small">
                  {r.evidence.records[i].structured
                    ? "有结构化自述可供回看"
                    : "信息仍不完整，作为待补充线索"}{" "}
                  · 未外部核验
                </p>
                {Object.entries(evidenceFields).map(([key, label]) => (
                  <p key={key}>
                    <b>{label}</b>
                    <br />
                    {e[key as EvidenceField].trim() || "暂未提供"}
                  </p>
                ))}
              </>
            )}
          </div>
        ))}
      </section>
      <section className="report-card">
        <h2>哪些条件可能帮助你发挥</h2>
        {r.growth.map((g, i) => (
          <div key={i}>
            <h3>{g.category} · 你提供的条件</h3>
            <p>已有支持：{g.support || "尚未说明"}</p>
            <p>希望补充：{g.need || "尚未说明"}</p>
          </div>
        ))}
        {!r.growth.length && (
          <p>尚未提供实际支持条件，下面仅是基于工作方式的待验证假设。</p>
        )}
        {r.conditions.map((c) => (
          <p key={c}>{c}</p>
        ))}
      </section>
      <section className="task-card">
        <span className="eyebrow">YOUR NEXT 7 DAYS</span>
        <h2>用一次行动，验证一条线索。</h2>
        <p>{r.next}</p>
        <p>
          记录：开始前期待什么 → 实际做了什么 → 哪些部分愿意继续 →
          下次改变一个什么条件。
        </p>
        {p.target && (
          <p>
            你想探索或排除的内容：{p.target}
            。请将它拆成可观察的任务和条件，不把目标直接当作适合与否的证据。
          </p>
        )}
      </section>
      <section className="report-card">
        <span className="eyebrow">05 / 九型人格 · 可选补充</span>
        <h2>核心动机反思</h2>
        {p.enneagramChoice === "skip" ? (
          <p>你跳过了本模块，四维基础画像不受影响。需要时可返回补充。</p>
        ) : (
          <>
            <p>
              以下是自述的动机倾向，不是诊断、隐藏恐惧的确定结论或唯一人格类型，不参与前四维计分和摘要。
            </p>
            <Scores scores={optional} names={enneagramNames} />
            <p>
              {motive.length > 0 && motive.length <= 3
                ? `本次可对照的倾向：${motive.map((d) => enneagramNames[d.dimension]).join("、")}。`
                : "本次没有明显分化的动机倾向，不强行定型。"}
            </p>
            {motive.length > 0 &&
              motive.length <= 3 &&
              motive.map((d) => (
                <div className="insight" key={d.dimension}>
                  <h3>{enneagramNames[d.dimension]}</h3>
                  <p>{enneagramDescriptions[d.dimension]?.meaning}</p>
                  <p>
                    可能有帮助的地方：
                    {enneagramDescriptions[d.dimension]?.strength}
                  </p>
                  <p>{enneagramDescriptions[d.dimension]?.tradeoff}</p>
                </div>
              ))}
            <p>
              反思：最近一次重要选择中，你在争取什么、担心失去什么？这种动机在何时帮助了你，又在何时限制了选择？请用真实事件检查，而不是接受标签。
            </p>
          </>
        )}
      </section>
      <section className="quality">
        <h3>如何理解与分享</h3>
        <p>
          核心问卷有效回答 {r.answered}/{r.coreTotal}
          。0–100为线性描述分，不是人群百分位。中文适配、原创题与整套规则未建立本地常模。
        </p>
        {r.flags.map((x) => (
          <p key={x}>{x}</p>
        ))}
        <p>
          报告用于自我探索，不用于心理诊断或招聘筛选。保存PDF后自行决定是否分享给服务方；沟通方式和时间按购买前约定。
          <a href="/sources">题库来源与方法说明</a>
        </p>
      </section>
    </div>
  );
}
