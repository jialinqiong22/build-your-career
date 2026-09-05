export default function PlanCards() {
  return (
    <section className="plans">
      <div className="section-label">选择适合你的探索深度</div>
      <div className="report-grid">
        <article className="report-card">
          <span className="eyebrow">IPIP-50 / 免费</span>
          <h2>先认识自己的五个维度</h2>
          <p>
            50道大五人格题，约7分钟。完成后即时查看五维结果与说明，无需注册。
          </p>
          <p className="small">
            约7分钟仅指50题大五模块，实际因阅读和作答速度而异。
          </p>
          <a className="primary" href="/big-five">
            开始50题免费版 ↗
          </a>
        </article>
        <article className="report-card premium-card">
          <span className="eyebrow">完整定位服务 / ¥199</span>
          <h2>全套测评、PDF与沟通</h2>
          <p>
            原创职业价值观40题＋霍兰德兴趣探索＋大五120题＋潜力证据与成长条件，生成PDF报告并提供沟通；九型原创动机反思作为第五项可选补充。
          </p>
          <p className="small">
            微信或支付宝人工确认收款后发放兑换码。120题不是50题简单追加70题，需要重新完整作答。
          </p>
          <a className="primary" href="/premium">
            了解199元套餐 / 兑换 ↗
          </a>
        </article>
      </div>
    </section>
  );
}
