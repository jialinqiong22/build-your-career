import Link from "next/link";
import { hollandQuestions, enneagramQuestions } from "@/lib/instruments";
export default function Sources() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
      </header>
      <main className="standalone">
        <h1>题库来源与使用说明</h1>
        <section className="report-card">
          <h2>原创职业价值观40题</h2>
          <p>
            围绕成长、收入、稳定、自主、贡献、平衡、团队联结与认可八个诉求编写，每维5题。不是施恩职业锚原版、舒伯WVI或其标准化中文版，也未继承这些量表的信效度。每维至少4题有效才显示线性描述分。
          </p>
          <p>
            另选三项价值诉求表示不能兼得时的主动取舍；排序不必与问卷得分一致。
          </p>
        </section>
        <section className="report-card">
          <h2>霍兰德兴趣与九型补充</h2>
          <p>
            兴趣模块为依据RIASEC六类活动编写的原创{hollandQuestions.length}
            题探索版；九型为本项目原创{enneagramQuestions.length}
            题动机反思。都不是经典标准量表，不复制第三方网站题库、SDS或RHETI题目。高分不等于能力、临床结论或职业成功概率。
          </p>
          <p>
            九型可跳过，单独解释，不参与核心报告摘要或证据分档。没有题库商用授权时，不因网站免费或代码仓库带MIT许可就擅自复用题目。
          </p>
          <p>
            <a href="/licenses/additional-sources.txt">来源核验与原创声明</a>
          </p>
        </section>
        <section className="report-card">
          <h2>证据信息分档，而非权重总分</h2>
          <p>
            五类经历分别记录情境、本人行动、结果、持续过程、结果线索和成长条件。没有结构较完整的记录为“信息较少”；一段完整记录，或多段尚无结果线索，为“已有一些”；至少两段不重复的较完整记录，且其中一段提供结果线索，为“较丰富”。这只是字段完整度的启发式规则，不判断真实性或能力。
          </p>
          <p>
            分档不读取学历、年级或方向清晰度，不按字数排名。阶段与方向仅改变引导，不产生总分；提供的支持条件单独呈现。自述再丰富也未经外部核验。
          </p>
        </section>
        <section className="report-card">
          <h2>50题免费大五</h2>
          <p>
            采用Goldberg IPIP-50题目和正反向键值。来源为{" "}
            <a href="https://github.com/KatherineGuoGuo/bigfive-open">
              bigfive-open
            </a>
            ，保留其MIT许可。英文题目属于IPIP公有领域，中文为本项目逐题适配。
          </p>
        </section>
        <section className="report-card">
          <h2>120题进阶大五</h2>
          <p>
            参考{" "}
            <a href="https://github.com/rubynor/bigfive-web">bigfive-web</a>{" "}
            的IPIP-NEO-120题目、ID、五维及30个细分特质映射。保留MIT许可；中文对照英文作了易懂性适配，未将旧译文或网站的常模主张直接沿用。
          </p>
        </section>
        <section className="report-card">
          <h2>如何看待结果</h2>
          <p>
            反向题按6减回答值计分，得分线性转换到0–100。此数字不是人群百分位，也不代表“超过多少人”。缺失题不计作低分；覆盖不足时不展示分数。50题不产生30项子维度，也不能当成120题的前50题复用。
          </p>
          <p>
            IPIP理论和英文题库有研究基础，但本项目中文适配、组合画像及阈值没有自动获得原研究的信效度。结果用于自我探索，不作心理诊断或录用决策。
          </p>
          <p>
            199元为完整测评流程、报告整理与沟通的服务费用，不是购买公开题目的版权，也不意味着比免费版更能预测职业成功。
          </p>
          <p>
            <a href="https://ipip.ori.org/">IPIP官方公有领域说明</a> ·{" "}
            <a href="/licenses/bigfive-sources.txt">完整开源许可与版本记录</a>
          </p>
        </section>
        <a className="secondary" href="/big-five">
          开始50题免费测评
        </a>
      </main>
    </>
  );
}
