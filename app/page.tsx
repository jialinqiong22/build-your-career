import Link from "next/link";
import PlanCards from "@/components/PlanCards";
import ModuleCatalog from "@/components/ModuleCatalog";
import AuthNav from "@/components/AuthNav";
import authStyles from "@/components/auth.module.css";
export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <div className={authStyles.headerMeta}>
          <span className="edition">个人定位仪 · 四维基础＋动机补充</span>
          <AuthNav />
        </div>
      </header>
      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">SELF DISCOVERY / 自我探索</span>
            <h1>
              在选择之前，
              <br />
              先看清自己。
            </h1>
            <p className="lead">
              什么让你投入，怎样做事更自在，
              <br />
              什么值得坚持，哪些经历值得继续验证。
            </p>
            <div className="hero-actions">
              <Link className="primary" href="/big-five">
                开始50题免费大五 ↗
              </Link>
              <Link className="secondary" href="/assessment">
                继续完整测评
              </Link>
            </div>
            <p className="small">
              本科、硕士在读与应届生 · 跨专业与行业 · 不以人格决定职业
            </p>
            {process.env.NODE_ENV === "development" && (
              <p>
                <Link className="secondary" href="/preview">
                  本机开发验收：体验完整流程
                </Link>
              </p>
            )}
          </div>
          <div className="portrait-note">
            <span className="eyebrow">YOU, IN CONTEXT</span>
            <h2>
              不是一个总分，
              <br />
              是五种认识自己的方式。
            </h2>
            <p>
              兴趣与价值观提供方向线索，工作方式帮助理解环境，真实经历让假设有处可验证。
            </p>
            <div className="note-rule" />
            <p>九型只补充动机反思；不参与核心结论。</p>
          </div>
        </section>
        <ModuleCatalog />
        <PlanCards />
        <section className="promise">
          <h2>让画像随着经历更新。</h2>
          <p>
            不规定固定占比，不生成个人定位总分。证据信息较少时多给探索任务；信息较丰富时多回看具体行动、结果与支持条件。年级和学历不决定你的档位。
          </p>
          <p className="small">
            本产品用于自我探索，不提供心理诊断、岗位匹配百分比、薪资预测或唯一职业结论。各模块题量不同，完整套餐可分次完成。
          </p>
          <Link href="/sources">查看来源、许可与测评边界</Link>
        </section>
      </main>
      <footer>
        <span>观己 / BUILD YOUR CAREER</span>
        <span>理解此刻，为下一步保留可能。</span>
      </footer>
    </>
  );
}
