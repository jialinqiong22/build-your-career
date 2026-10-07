import BigFiveResults from "./BigFiveResults";
import InterestRadar from "./InterestRadar";
import "./report-print.css";
import ResultImages from "./ResultImages";
import { buildModuleCards, hollandCode, enneagramType } from "@/lib/module-results";
import { report, type Profile, type SuiteBanks } from "@/lib/positioning";
import { valueDescriptions } from "@/lib/values";
import {
  hollandNames,
  hollandDescriptions,
  enneagramNames,
  enneagramDescriptions,
  scoreInstrument,
} from "@/lib/instruments";
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
  const motives = scoreInstrument(banks.enneagram, p.enneagramAnswers);
  const highest = Math.max(
    ...motives.filter((x) => x.score !== null).map((x) => x.score!),
  );
  const motive = motives.filter(
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
        <p className="small">生成日期：{new Date().toLocaleDateString("zh-CN")} · 规则版本 {r.version}</p>
      </header>
      <section className="summary">
        <span className="eyebrow">先读这里 / 四维分开看</span>
        <h2>{r.summary}</h2>
        <p>{r.directionAdvice}</p>
        <p>
          本报告没有个人定位总分、固定权重或岗位匹配百分比。各模块倾向不等于实际能力。
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
        <p><strong>兴趣代码：{hollandCode(r.interest) ?? "并列或信息不足，暂不确定唯一代码"}</strong></p>
        <InterestRadar scores={r.interest} />
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
        <span className="eyebrow">04 / 九型人格</span>
        <h2>核心动机反思</h2>
        <p><strong>探索性类型：{enneagramType(motives) ?? "并列或信息不足，暂不确定"}</strong></p>
        <>
            <p>
              以下是自述的动机倾向，不是诊断或确定的人格结论，不改变其他三个模块的得分。
            </p>
            <Scores scores={motives} names={enneagramNames} />
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
      </section>
      <ResultImages cards={buildModuleCards(p,banks)} />
      <section className="quality">
        <h3>如何理解与分享</h3>
        <p>
          价值观、兴趣与大五有效回答 {r.answered}/{r.coreTotal}
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
