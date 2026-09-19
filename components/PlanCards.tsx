import Link from "next/link";
import WeChatContact from "./WeChatContact";

export default function PlanCards() {
  return (
    <section className="plans" id="plans" aria-labelledby="plans-title">
      <span className="section-label">选择适合你的探索深度</span>
      <h2 id="plans-title">把四块信息，放在一起看。</h2>
      <p>价值观、兴趣、工作方式，和能验证判断的经历。按照你需要的支持，选择下一步。</p>
      <div className="report-grid landing-plan-grid">
        <article className="report-card">
          <span className="eyebrow">完整四维，自己看</span>
          <p className="price">¥9.9<span> / 一次购买</span></p>
          <h3>先把自己的情况理清楚</h3>
          <p>补完价值观、兴趣、潜力证据三块，结合大五50题，生成在线结构化定位小结。</p>
          <ul><li>四个核心维度，分别呈现</li><li>区分自述证据与待验证假设</li><li>九型动机反思，可选跳过</li><li>登录后保存进度与查看历史</li></ul>
          <p className="small">适合想先理清自己，还没决定要不要找人聊的人。</p>
          <WeChatContact plan="standard" />
          <Link className="primary" href="/premium?plan=standard">先完整测一遍 ↗</Link>
        </article>
        <article className="report-card">
          <span className="eyebrow">完整四维＋一次沟通</span>
          <p className="price">¥99<span> / 一次购买</span></p>
          <h3>把结果讲清楚，再讨论下一步</h3>
          <p>包含¥9.9的全部权益，增加细分特质、完整PDF与一次1对1沟通。</p>
          <ul><li>大五120题与30项细分特质</li><li>完整PDF报告，便于留存</li><li>一次人工1对1沟通</li><li>一起梳理具体可以做的事</li></ul>
          <p className="small">120题需独立完整作答，不是在50题之后追加70题。</p>
          <WeChatContact plan="guided" />
          <Link className="primary" href="/premium?plan=guided">预约完整定位＋沟通 ↗</Link>
        </article>
      </div>
      <p className="small">微信或支付宝人工确认收款后发放兑换码，不自动订阅、不会自动扣费。实际购买方式以套餐页可用渠道为准。</p>
      <Link className="landing-text-link" href="/sources">查看测评来源、授权与边界说明 →</Link>
    </section>
  );
}
