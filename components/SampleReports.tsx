import { sampleReports, type SampleReport } from "@/lib/sample-reports";

const scopeBadge = (report: SampleReport) =>
  report.scope === "free" ? (
    <span className="case-badge case-badge-scope">免费 · 大五视角</span>
  ) : (
    <span className="case-badge case-badge-scope">¥9.9 · 完整四维视角</span>
  );

const sourceBadge = (report: SampleReport) =>
  report.source === "consented" ? (
    <span className="case-badge case-badge-real">真实用户 · 已获同意展示</span>
  ) : (
    <span className="case-badge" data-source="sample">示例数据</span>
  );

export default function SampleReports() {
  return (
    <section className="landing-cases" aria-labelledby="cases-title">
      <span className="eyebrow">样 本 · 以下均为示例数据</span>
      <h2 id="cases-title">测完你会得到什么</h2>
      <p>
        六份不同年级、专业与院校的示例，前两份展示免费大五能看到什么，其余四份展示¥9.9完整四维如何把价值观、兴趣与大五、经历证据放在一起。分数是量表内的倾向描述，不代表人群百分位、能力或成功概率；示例人物为虚构，院校名称仅用于设定场景。正式上线后展示的真实案例会先取得本人同意，并按来源标注。
      </p>
      <div className="landing-cases-grid">
        {sampleReports.map((report) => (
          <article className="landing-case" key={report.id}>
            <div className="case-avatar">
              <img src={`/avatars/${report.avatar}.svg`} alt="" width={56} height={56} loading="lazy" />
            </div>
            <div className="case-badges">
              {scopeBadge(report)}
              {report.tierLabel && <span className="case-badge case-badge-tier">{report.tierLabel}</span>}
              {sourceBadge(report)}
            </div>
            <h3>{report.persona}</h3>
            {report.tierNote && <p className="case-tier-note">{report.tierNote}</p>}
            <div className="bars">
              {report.bigFive.map(([name, score]) => (
                <div className="bar" key={name}>
                  <div><span>{name}</span><span>{score} / 100</span></div>
                  <div className="track" aria-hidden="true"><span style={{ width: `${score}%` }} /></div>
                </div>
              ))}
            </div>
            {report.scope === "free" ? (
              <p className="case-free-note">
                完整版在此基础上增加价值观、兴趣与经历证据，并把“是什么”讲成“下一步做什么”。
              </p>
            ) : (
              <>
                <div className="case-chips">
                  <span className="case-chips-label">当前看重的价值观</span>
                  {report.valuesTop!.map((value) => <span key={value}>{value}</span>)}
                  <span className="case-chips-label">兴趣较突出的方向</span>
                  {report.interestTop!.map((interest) => <span key={interest}>{interest}</span>)}
                </div>
                <details>
                  <summary>展开看这份样本的线索与任务</summary>
                  <p><strong>一句定位线索：</strong>{report.headline}</p>
                  <p><strong>待验证假设：</strong>{report.hypothesis}</p>
                  <div className="case-task"><strong>探索任务示例</strong><p>{report.task}</p></div>
                </details>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
