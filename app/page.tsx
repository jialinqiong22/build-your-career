import Link from "next/link";
import PlanCards from "@/components/PlanCards";
import ModuleCatalog from "@/components/ModuleCatalog";
import AuthNav from "@/components/AuthNav";
import ReportPreview from "@/components/ReportPreview";
import SampleReports from "@/components/SampleReports";
import LandingFaq from "@/components/LandingFaq";
import authStyles from "@/components/auth.module.css";

export default function Home() {
  return (
    <div className="landing-page">
      <header className="site-header">
        <Link className="brand" href="/">观己<span>BUILD YOUR CAREER</span></Link>
        <div className={authStyles.headerMeta}><AuthNav /></div>
      </header>
      <main>
        <section className="landing-hero">
          <span className="eyebrow">个人定位 · 从了解自己开始</span>
          <h1>在选择方向之前，<br />先看清楚自己现在的样子。</h1>
          <p className="lead">职业价值观、兴趣、工作方式、过往经历——四块信息拼在一起，才谈得上“方向”。</p>
          <p>不打分排名，不给你一个职业结论。</p>
          <div className="hero-actions">
            <Link className="primary" href="/big-five">开始50题免费大五 ↗</Link>
            <a className="secondary" href="#modules">了解完整测评包含什么</a>
          </div>
          <p className="landing-cta-note">7分钟看结果，不用注册</p>
          <p className="small landing-trust">完整版最低¥9.9起 · 本科、硕士在读与应届生 · 原创探索题＋IPIP公开量表 · 结果仅供自我探索参考</p>
        </section>
        <section className="landing-comparison" aria-labelledby="comparison-title">
          <h2 id="comparison-title">从一项开始，也可以看完整的自己。</h2>
          <table>
            <caption className="sr-only">免费与付费权益对比</caption>
            <thead><tr><th scope="col">内容</th><th scope="col">免费</th><th scope="col">¥9.9</th><th scope="col">¥99</th></tr></thead>
            <tbody>
              <tr><th scope="row">大五50题</th><td>含</td><td>含</td><td>含</td></tr>
              <tr><th scope="row">价值观 / 兴趣 / 行为证据</th><td>—</td><td>含</td><td>含</td></tr>
              <tr><th scope="row">120题细分＋PDF＋沟通</th><td>—</td><td>—</td><td>含</td></tr>
            </tbody>
          </table>
          <p className="small">往下看每一项具体测什么，或<a href="#plans">直接查看价格详情 →</a></p>
        </section>
        <ReportPreview />
        <ModuleCatalog />
        <SampleReports />
        <section className="landing-free" aria-labelledby="free-title">
          <div><span className="eyebrow">免费体验 / IPIP-50</span><h2 id="free-title">先测一项：你通常怎么做事</h2><p>50道大五人格题，约7分钟，当场看结果，不用注册。</p><p className="small">工作方式是其中一块；价值取舍、方向兴趣与行为证据，需要在完整测评中分别探索。</p></div>
          <Link className="primary" href="/big-five">开始50题免费大五 ↗</Link>
        </section>
        <PlanCards />
        <section className="landing-faq" aria-labelledby="faq-title">
          <span className="eyebrow">开始之前</span><h2 id="faq-title">你可能还想知道</h2>
          <LandingFaq />
        </section>
      </main>
      <footer><span>观己 / BUILD YOUR CAREER</span><span><Link href="/privacy">隐私政策</Link> · <Link href="/terms">用户协议</Link></span><span>理解此刻，为下一步保留可能。</span></footer>
    </div>
  );
}
