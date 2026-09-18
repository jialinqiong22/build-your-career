const demoScores = [
  ["开放性", 72], ["尽责性", 64], ["外向性", 46],
  ["宜人性", 68], ["情绪稳定性", 55],
] as const;

export default function ReportPreview() {
  return (
    <section className="landing-preview" aria-labelledby="preview-title">
      <span className="eyebrow">结果预览 · 以下均为演示数据</span>
      <h2 id="preview-title">先看一眼，结果会怎么呈现</h2>
      <p>免费结果先告诉你通常怎么做事。完整测评会把价值观、兴趣和行为证据放在一起，区分已有线索与需要验证的判断。</p>
      <div className="landing-preview-grid">
        <article className="landing-sample">
          <span className="eyebrow">01 / 免费大五</span><h3>你的工作方式</h3>
          <div className="bars">{demoScores.map(([name, score]) => <div className="bar" key={name}><div><span>{name}</span><span>{score} / 100</span></div><div className="track" aria-hidden="true"><span style={{width: `${score}%`}} /></div></div>)}</div>
          <p className="small">演示结果偏向探索新想法。分数是量表内的倾向，不是人群百分位、能力或成功率。</p>
        </article>
        <article className="landing-sample">
          <span className="eyebrow">02 / ¥9.9 在线小结</span><h3>从倾向，走向证据</h3>
          <dl className="landing-sample-notes"><dt>当前看重</dt><dd>成长与自主：希望有学习空间，也能决定做事方式。</dd><dt>自述线索</dt><dd>在一次课程研究中，主动拆解问题并组织访谈。</dd><dt>仍需验证</dt><dd>这份投入感来自研究本身，还是熟悉的团队与充分准备？</dd></dl>
          <p className="small">演示经历，自述未经核验。不给个人总分，不据此推荐唯一职业。</p>
        </article>
        <article className="landing-sample">
          <span className="eyebrow">03 / ¥99 PDF 内容示意</span><h3>留给下一步的行动</h3>
          <ol className="landing-sample-outline"><li>四维结果与当前线索</li><li>大五30项细分特质</li><li>经历、反馈与支持条件</li><li>待验证假设与探索任务</li></ol>
          <div className="landing-sample-task"><strong>探索任务示例</strong><p>选择一个陌生问题，独立完成一次小研究。记录投入感、困难与需要的支持，再回看原来的判断。</p></div>
          <p className="small">此处为内容示意，非实际用户报告。人工沟通在测评后另行安排。</p>
        </article>
      </div>
    </section>
  );
}
