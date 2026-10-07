import type { Metadata } from "next";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import LandingFaq from "@/components/LandingFaq";
import PlanCards from "@/components/PlanCards";
import authStyles from "@/components/auth.module.css";

export const metadata: Metadata = {
  title: "观己 · 探索你的优势",
  description: "完成大五人格、霍兰德职业兴趣、职业价值观与九型人格，保存统一结果并预约求职定位咨询。",
};

const steps = [
  {
    title: "开始大五人格",
    text: "先完成免费50题，了解五个维度的做事倾向。",
  },
  {
    title: "看兴趣与价值观",
    text: "完成霍兰德职业兴趣和职业价值观，看看愿意投入哪些任务、在乎哪些条件。",
  },
  {
    title: "完成九型人格",
    text: "查看本次动机倾向，以及有明确差异时的类型与翼型线索。",
  },
  {
    title: "保存结果，添加咨询",
    text: "把四个模块结果发给我，说明求职定位问题，再约沟通时间。",
  },
];

export default function Home() {
  return (
    <div className="landing-page">
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>ANCHOR POINT CAREER</span>
        </Link>
        <div className={authStyles.headerMeta}>
          <AuthNav />
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div>
            <span className="eyebrow">给学生</span>
            <h1>
              先探索
              <br />
              你的优势。
            </h1>
            <p className="lead">完成大五、霍兰德兴趣、职业价值观和九型人格，保存四个结果，发给我再约时间沟通。</p>
            <div className="hero-actions">
              <Link className="primary" href="/big-five">
                开始50题免费大五
              </Link>
              <a className="secondary" href="#offer">
                想找人聊聊
              </a>
            </div>
            <p className="landing-cta-note">免费大五约7分钟，无需注册。<Link href="/assessment">查看四个测评模块</Link></p>
          </div>
          <article className="landing-memo" aria-label="比如这样">
            <span className="eyebrow">比如这样</span>
            <p className="landing-memo-label">你的优势</p>
            <p className="landing-conflict">例如：霍兰德 RIA，九型 7w6；大五显示五个维度的分数，价值观列出你主动选择的三项诉求。</p>
            <p className="landing-memo-label">你可以先做的一件事</p>
            <p>先保存四个模块的统一结果图，再带着一个想讨论的求职定位问题预约沟通。这里展示的是结果样例。</p>
          </article>
        </section>

        <section className="landing-compare" aria-labelledby="compare-title">
          <span className="eyebrow">看之前 / 看之后</span>
          <h2 id="compare-title">看完，你会更认得自己。</h2>
          <div className="landing-split">
            <article className="landing-panel">
              <p className="landing-memo-label">看之前</p>
              <h3>还说不出自己的优势在哪</h3>
              <p>知道自己有时想一个人把问题想清楚，也隐约觉得该写下来。只是还没开始看。</p>
            </article>
            <article className="landing-panel landing-panel-after">
              <p className="landing-memo-label">看完之后</p>
              <h3>能分别说清做事倾向、兴趣、取舍与动机</h3>
              <p>保存各模块结果，带着具体问题和咨询老师讨论；下一步由你的目标与实际条件一起决定。</p>
            </article>
          </div>
        </section>

        <section className="landing-method" id="steps" aria-labelledby="steps-title">
          <span className="eyebrow">四步</span>
          <h2 id="steps-title">跟着好奇心走。</h2>
          <ol className="landing-steps-grid">
            {steps.map((item, index) => (
              <li key={item.title}>
                <span className="landing-step-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <PlanCards />

        <section className="landing-faq" aria-labelledby="faq-title">
          <span className="eyebrow">开始之前</span>
          <h2 id="faq-title">你可能还想知道</h2>
          <LandingFaq />
        </section>
      </main>
      <footer>
        <span>观己 / ANCHOR POINT CAREER</span>
        <span>
          <Link href="/privacy">隐私政策</Link> · <Link href="/terms">用户协议</Link> ·{" "}
          <Link href="/sources">测评来源</Link>
        </span>
        <span>从好奇心开始。</span>
      </footer>
    </div>
  );
}
