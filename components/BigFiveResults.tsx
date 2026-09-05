import { scoreBigFive } from "@/lib/bigfive/scoring";
import type { BigFiveQuestion } from "@/lib/bigfive/types";
const names: Record<string, string> = {
  E: "外向性",
  A: "宜人性",
  C: "尽责性",
  N: "情绪敏感性",
  O: "开放性 / 智力想象",
};
const descriptions: Record<string, [string, string, string]> = {
  E: [
    "更偏向安静、独立的互动方式。",
    "既可能享受社交，也需要独处。",
    "更倾向主动社交和表达。",
  ],
  A: [
    "更直接、重独立判断，留意表达方式。",
    "会在体谅他人与维护立场间调整。",
    "较重视体谅和合作，也要照顾自身边界。",
  ],
  C: [
    "组织与坚持可能更依赖情境，可尝试清单支持。",
    "计划与灵活性并存，具体习惯值得观察。",
    "倾向有计划、负责和持续推进。",
  ],
  N: [
    "自述的负面情绪反应相对较少。",
    "情绪反应随情境变化，留意恢复方式。",
    "对压力与情绪变化较敏感，不等同于抗压能力差或心理诊断。",
  ],
  O: [
    "较偏好熟悉、具体的经验。",
    "在熟悉经验和探索新观点间保持平衡。",
    "较偏好想象、思考与接触新观念，不表示智力排名。",
  ],
};
export default function BigFiveResults({
  items,
  answers,
}: {
  items: readonly BigFiveQuestion[];
  answers: Record<string, number | null>;
}) {
  const scores = scoreBigFive(items, answers);
  return (
    <section>
      <h2>大五人格画像 · {items.length}题版</h2>
      <p className="small">
        下列0–100是题目得分的线性换算，不是人群百分位。50题与120题测量范围不同，不宜直接比较分数涨跌。中文为本项目适配译文，尚未建立本地常模。
      </p>
      <div className="report-grid">
        {scores.map((d) => (
          <article className="report-card" key={d.dimension}>
            <h3>{names[d.dimension]}</h3>
            <div className="score-number">
              {d.score === null ? "信息不足" : d.score}
              <small>{d.score === null ? "" : " / 100"}</small>
            </div>
            <div className="track">
              <span style={{ width: `${d.score ?? 0}%` }} />
            </div>
            <p>
              {d.score === null
                ? "有效回答未达到最低覆盖要求，暂不推断。"
                : descriptions[d.dimension][
                    d.score < 35 ? 0 : d.score > 65 ? 2 : 1
                  ]}
            </p>
            <p className="small">
              有效回答 {d.answered} / {d.expected} ·{" "}
              {d.answered < d.expected
                ? "含缺失，按有效题均值估计"
                : "完整作答"}
            </p>
            {d.facets?.length > 0 && (
              <div className="facets">
                {d.facets.map((f) => (
                  <div key={f.id}>
                    <span>{f.name}</span>
                    <span>
                      {f.score === null ? "信息不足" : `${f.score} / 100`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <p className="small">
        高低都有适用情境，不用单个分数决定专业、岗位或个人价值。
        <a href="/sources">查看题库来源与许可</a>
      </p>
    </section>
  );
}
