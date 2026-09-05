"use client";
import { useEffect, useState } from "react";
import {
  KEY,
  VERSION,
  blank,
  validProfile,
  finished,
  interests,
  traits,
  values,
  stages,
  directions,
  evidenceNames,
  evidenceLevels,
  interestNames,
  traitNames,
  activities,
  report,
  type Profile,
  type Question,
} from "@/lib/assessment";
const steps = [
  "开始之前",
  "什么吸引你",
  "你如何做事",
  "什么更重要",
  "你的真实经历",
];
const guidance = [
  "先积累不同活动的体验，你不需要现在决定未来。",
  "把“不想要”写成具体条件，同时为陌生的活动保留尝试空间。",
  "用这份画像检查感兴趣方向里的具体活动和环境。",
  "把目标当作待验证的选择。偏好差异不会否定你的目标。",
];
function Bars({
  items,
  names,
}: {
  items: { dimension: string; score: number | null }[];
  names: Record<string, string>;
}) {
  return (
    <div className="bars">
      {items.map((x) => (
        <div className="bar" key={x.dimension}>
          <div>
            <span>{names[x.dimension]}</span>
            <span>{x.score === null ? "信息不足" : x.score + " / 100"}</span>
          </div>
          <div className="track">
            <span style={{ width: `${x.score ?? 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default function Home() {
  const [p, setP] = useState<Profile>(blank),
    [view, setView] = useState<"home" | "quiz" | "report">("home"),
    [step, setStep] = useState(0),
    [save, setSave] = useState(false),
    [ready, setReady] = useState(false),
    [consent, setConsent] = useState(false),
    [notice, setNotice] = useState(""),
    [saved, setSaved] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (validProfile(data)) {
          setP(data);
          setSave(true);
          setSaved(true);
        } else localStorage.removeItem(KEY);
      }
    } catch {
      setNotice("无法读取本机记录，将使用当前页面暂存。");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !save) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
      setSaved(true);
    } catch {
      setNotice("本机保存失败，请保持页面开启，完成后导出结果。");
    }
  }, [p, save, ready]);
  function navigate(next: typeof view) {
    setView(next);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function clear() {
    if (!window.confirm("清除这份测评及本机续答记录？此操作无法撤销。")) return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      setNotice("浏览器阻止记录删除，请在浏览器设置中清除此网站的数据。");
      return;
    }
    setSave(false);
    setSaved(false);
    setP(blank());
    setStep(0);
    setConsent(false);
    navigate("home");
  }
  function toggleSave(checked: boolean) {
    if (!checked) {
      try {
        localStorage.removeItem(KEY);
        setSaved(false);
      } catch {
        setNotice("记录未能删除，请在浏览器设置中清除此网站的数据。");
        return;
      }
    }
    setSave(checked);
  }
  function next() {
    let message = "";
    if (step === 0 && !consent) message = "请先确认已了解使用说明。";
    if (step === 1 || step === 2) {
      const qs = step === 1 ? interests : traits;
      if (qs.some((q) => !Object.hasOwn(p.answers, q.id)))
        message =
          "还有未回答的题目；暂时无法判断时，可选择“不了解 / 无法判断”。";
    }
    if (step === 3 && p.priorities.length !== 3)
      message = "请依次选择三个当前最重要的诉求。";
    if (step === 4 && !finished(p))
      message = "有经历的项目，请用至少12个字说明你的行动和结果。";
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (step === 4) navigate("report");
    else {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { ...p, generatedAt: new Date().toISOString(), report: report(p) },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "观己-个人定位画像.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function questions(qs: Question[], kind: "interest" | "trait") {
    const labels =
      kind === "interest"
        ? ["很不喜欢", "不太喜欢", "一般", "比较喜欢", "很喜欢"]
        : ["很不符合", "不太符合", "有时符合", "比较符合", "很符合"];
    return qs.map((q, i) => (
      <fieldset className="question" key={q.id}>
        <legend>
          <span className="question-number">
            {String(i + 1).padStart(2, "0")}
          </span>
          {q.text}
        </legend>
        <div className="likert">
          {labels.map((label, j) => (
            <label
              className={
                p.answers[q.id] === j + 1 ? "choice selected" : "choice"
              }
              key={label}
            >
              <input
                type="radio"
                name={q.id}
                checked={p.answers[q.id] === j + 1}
                onChange={() =>
                  setP({ ...p, answers: { ...p.answers, [q.id]: j + 1 } })
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <label className="unknown">
          <input
            type="radio"
            name={q.id}
            checked={Object.hasOwn(p.answers, q.id) && p.answers[q.id] === null}
            onChange={() =>
              setP({ ...p, answers: { ...p.answers, [q.id]: null } })
            }
          />{" "}
          不了解 / 无法判断
        </label>
      </fieldset>
    ));
  }
  const r = report(p);
  return (
    <>
      <header className="site-header">
        <button className="brand" onClick={() => navigate("home")}>
          观己<span>BUILD YOUR CAREER</span>
        </button>
        <span className="edition">
          个人定位仪 <i>探索版 02</i>
        </span>
      </header>
      <main>
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {view === "home" && (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">SELF DISCOVERY / 自我探索</div>
                <h1>
                  在选择之前，
                  <br />
                  先看清<span>自己。</span>
                </h1>
                <p className="intro">
                  什么让你投入，怎样做事更自在，
                  <br />
                  什么值得你长期坚持。
                  <br />
                  从四个角度，描绘你的个人定位画像。
                </p>
                <div className="hero-actions">
                  <button
                    className="primary"
                    disabled={!ready}
                    onClick={() => {
                      setStep(0);
                      navigate("quiz");
                    }}
                  >
                    {saved ? "继续我的探索" : "开始探索自己"} ↗
                  </button>
                  {saved && finished(p) && (
                    <button
                      className="secondary"
                      onClick={() => navigate("report")}
                    >
                      查看已有画像
                    </button>
                  )}
                </div>
                <p className="small">
                  适合本科、硕士在读与应届生 · 跨专业使用 · 无需注册
                </p>
              </div>
              <div
                className="compass"
                aria-label="兴趣、工作方式、价值观、经历四个探索维度"
              >
                <div className="orbit outer" />
                <div className="orbit inner" />
                <div className="axis horizontal" />
                <div className="axis vertical" />
                <div className="compass-center">
                  我<span>YOU, IN CONTEXT</span>
                </div>
                <span className="point north">
                  01
                  <br />
                  <b>兴趣</b>
                </span>
                <span className="point east">
                  02
                  <br />
                  <b>工作方式</b>
                </span>
                <span className="point south">
                  03
                  <br />
                  <b>价值观</b>
                </span>
                <span className="point west">
                  04
                  <br />
                  <b>真实经历</b>
                </span>
                <div className="compass-caption">
                  每条线索，都是理解自己的一个角度。
                </div>
              </div>
            </section>
            <section className="overview">
              <div className="section-label">一份画像，四种线索</div>
              <div className="four-grid">
                {[
                  ["01", "什么吸引你", "发现你愿意接近的问题与活动。"],
                  ["02", "你如何做事", "理解协作、变化与节奏偏好。"],
                  ["03", "什么更重要", "看清选择机会时的优先级。"],
                  ["04", "你做过什么", "从具体行动中寻找潜力线索。"],
                ].map(([n, title, text]) => (
                  <article key={n}>
                    <span className="serif-number">{n}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="bottom-note">
              <h2>给自己一份可以更新的画像。</h2>
              <p>
                你会得到兴趣与工作方式概览、贡献线索、环境偏好和一个七天探索行动。结论来自本次自述，随着经历增长，可以重新理解和修订。
              </p>
              <p className="small">
                原创中文探索题，参考 RIASEC
                与大五概念。尚未经过标准化信效度验证，供自我探索使用。
              </p>
            </section>
            {saved && (
              <button className="text-button" onClick={clear}>
                清除本机测评记录
              </button>
            )}
          </>
        )}
        {view === "quiz" && (
          <div className="assessment-layout">
            <aside className="step-sidebar">
              <div className="eyebrow">YOUR EXPLORATION</div>
              <h2>
                慢一点，
                <br />
                真实一点。
              </h2>
              <nav aria-label="测评进度">
                {steps.map((s, i) => (
                  <div className={i === step ? "step active" : "step"} key={s}>
                    <span>
                      {i < step ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    {s}
                  </div>
                ))}
              </nav>
              <p className="small">
                {save
                  ? "已选择本机续答。共用设备请在完成后清除记录。"
                  : "当前仅在页面内暂存，刷新或关闭会丢失进度。"}
              </p>
            </aside>
            <section className="quiz-body">
              <div className="eyebrow">STEP {step + 1} / 5</div>
              <h1 className="page-title">{steps[step]}</h1>
              {step === 0 && (
                <>
                  <p className="lead">
                    从现在的自己出发。没有标准答案，也不需要已有实习经历。
                  </p>
                  <div className="info-box">
                    <h3>开始前，请了解</h3>
                    <p>
                      本测评由18道兴趣题、15道工作方式题、价值排序和4项经历组成。使用原创探索题，结果不代表标准化心理评估、能力测定或职业成功概率。
                    </p>
                    <p>
                      回答仅在你的浏览器中处理。默认不保存，选择本机续答后才写入当前设备。没有账号或第三方传输；记录不会自动过期，可随时清除。经历里请避免姓名、联系方式和他人隐私。
                    </p>
                  </div>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    我已了解用途、测评局限和数据处理方式。
                  </label>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={save}
                      onChange={(e) => toggleSave(e.target.checked)}
                    />
                    在这台设备保存进度，方便下次继续（可选）
                  </label>
                  <label className="field-label">
                    目前阶段
                    <select
                      value={p.stage}
                      onChange={(e) => setP({ ...p, stage: e.target.value })}
                    >
                      {stages.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    你现在对方向的感觉
                    <select
                      value={p.direction}
                      onChange={(e) =>
                        setP({ ...p, direction: e.target.value })
                      }
                    >
                      {directions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    想探索的方向，或已知的不喜欢（可选）
                    <textarea
                      maxLength={200}
                      value={p.target}
                      onChange={(e) => setP({ ...p, target: e.target.value })}
                      placeholder="例如：喜欢金融，但不确定喜欢的是哪些活动；不喜欢频繁陌生拜访。"
                    />
                  </label>
                </>
              )}
              {step === 1 && (
                <>
                  <p className="lead">
                    假设有机会尝试，你有多喜欢以下活动？不考虑现在做得好不好。
                  </p>
                  {questions(interests, "interest")}
                </>
              )}
              {step === 2 && (
                <>
                  <p className="lead">
                    回想最近半年的通常表现，而不是理想中的自己。
                  </p>
                  {questions(traits, "trait")}
                </>
              )}
              {step === 3 && (
                <>
                  <p className="lead">
                    如果不能全部满足，你当前最希望优先保留什么？按重要顺序选三项，点击已选项可取消。
                  </p>
                  <div className="value-grid">
                    {values.map((v) => (
                      <button
                        key={v}
                        className={
                          p.priorities.includes(v) ? "value selected" : "value"
                        }
                        aria-pressed={p.priorities.includes(v)}
                        disabled={
                          p.priorities.length === 3 && !p.priorities.includes(v)
                        }
                        onClick={() =>
                          setP({
                            ...p,
                            priorities: p.priorities.includes(v)
                              ? p.priorities.filter((x) => x !== v)
                              : [...p.priorities, v],
                          })
                        }
                      >
                        <span>
                          {p.priorities.includes(v)
                            ? "0" + (p.priorities.indexOf(v) + 1)
                            : "＋"}
                        </span>
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="info-box">
                    当前顺序：{p.priorities.join(" → ") || "尚未选择"}
                    <p className="small">
                      这是当前取舍，可以随人生阶段变化。没有更高尚或更正确的选项。
                    </p>
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <p className="lead">
                    课程、社团、生活和自学经历都可以。没有经历也是有效信息。
                  </p>
                  {evidenceNames.map((name, i) => (
                    <div className="evidence-form" key={name}>
                      <h3>{name}</h3>
                      <p>
                        {
                          [
                            "例如：比较资料、调查一个问题或整理数据。",
                            "例如：完成文章、设计、模型或新的解决方案。",
                            "例如：帮助同学、处理分歧或讲清一个概念。",
                            "例如：推进活动、按计划完成自学或改善流程。",
                          ][i]
                        }
                      </p>
                      <label className="field-label">
                        目前的经历状态
                        <select
                          value={p.evidence[i].level}
                          onChange={(e) =>
                            setP({
                              ...p,
                              evidence: p.evidence.map((x, j) =>
                                j === i
                                  ? {
                                      level: Number(e.target.value),
                                      text:
                                        Number(e.target.value) === 0
                                          ? ""
                                          : x.text,
                                    }
                                  : x,
                              ),
                            })
                          }
                        >
                          {evidenceLevels.map((s, j) => (
                            <option value={j} key={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      {p.evidence[i].level > 0 && (
                        <label className="field-label">
                          你面对什么问题？本人做了什么？结果或反馈是什么？
                          <textarea
                            minLength={12}
                            maxLength={600}
                            value={p.evidence[i].text}
                            onChange={(e) =>
                              setP({
                                ...p,
                                evidence: p.evidence.map((x, j) =>
                                  j === i ? { ...x, text: e.target.value } : x,
                                ),
                              })
                            }
                            placeholder="例如：我记录了一周用水数据，做了对比表，发现记录口径不一致，后来修正了方法。"
                          />
                          <small>
                            至少12字；仅记录自述，不会把参与头衔自动视为能力证明。
                          </small>
                        </label>
                      )}
                    </div>
                  ))}
                </>
              )}
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              <div className="quiz-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    if (step === 0) navigate("home");
                    else {
                      setStep(step - 1);
                      setError("");
                      window.scrollTo(0, 0);
                    }
                  }}
                >
                  ← {step === 0 ? "返回首页" : "上一步"}
                </button>
                <button className="primary" onClick={next}>
                  {step === 4 ? "生成我的画像" : "下一步"} ↗
                </button>
              </div>
            </section>
          </div>
        )}
        {view === "report" && (
          <div className="report">
            <div className="report-heading">
              <div className="eyebrow">PERSONAL PORTRAIT / {VERSION}</div>
              <h1>你的个人定位画像</h1>
              <p>
                {p.stage} · {p.direction}
              </p>
            </div>
            <section className="summary">
              <span className="section-label">01 / 当前的你</span>
              <h2>{r.summary}</h2>
              <p>{guidance[directions.indexOf(p.direction)]}</p>
              {p.target && (
                <p className="personal-note">
                  你带来的问题：{p.target}
                  <br />
                  <small>
                    以下是自我观察线索，尚未对该方向进行岗位或可行性判断。
                  </small>
                </p>
              )}
            </section>
            <div className="report-grid">
              <section className="report-card">
                <span className="section-label">02 / 兴趣倾向</span>
                <h2>什么让你愿意靠近</h2>
                <Bars items={r.interest} names={interestNames} />
                <p className="small">
                  分数表示本次回答的喜欢程度，不表示能力或人群排名。
                </p>
              </section>
              <section className="report-card">
                <span className="section-label">03 / 工作方式</span>
                <h2>你通常如何回应世界</h2>
                <Bars items={r.trait} names={traitNames} />
                <p className="small">
                  高低不代表好坏。情绪敏感也不等于抗压能力差；仅反映自述反应倾向。
                </p>
              </section>
            </div>
            <section className="report-card">
              <span className="section-label">04 / 当前优先级</span>
              <div className="priority-row">
                {p.priorities.map((v, i) => (
                  <div key={v}>
                    <span>0{i + 1}</span>
                    <h2>{v}</h2>
                  </div>
                ))}
              </div>
              <p>
                比较机会时，先把这三项写成可核对的条件，再确认哪些可以妥协。
              </p>
              {r.conflicts.map((t) => (
                <p className="info-box" key={t}>
                  {t}
                </p>
              ))}
            </section>
            <div className="report-grid">
              <section className="report-card">
                <span className="section-label">05 / 贡献线索</span>
                <h2>值得尝试的活动</h2>
                {r.leading.length ? (
                  r.leading.map((x) => (
                    <div className="contribution" key={x.dimension}>
                      <h3>{activities[x.dimension].text}</h3>
                      <p>
                        {p.evidence[activities[x.dimension].evidence].level > 0
                          ? "你在相关经历类别中提供了自述，可对照下方具体行动继续检查。"
                          : "当前缺少相关经历支持，先作为待验证的兴趣假设。"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>
                    暂未形成明显兴趣方向。先比较不同任务的体验，保留多个可能性。
                  </p>
                )}
              </section>
              <section className="report-card">
                <span className="section-label">06 / 环境线索</span>
                <h2>让自己更自在的条件</h2>
                {r.environments.length ? (
                  r.environments.map((t) => (
                    <p className="environment" key={t}>
                      {t}
                    </p>
                  ))
                ) : (
                  <p>工作方式有效回答不足，暂不推断环境偏好。</p>
                )}
                <p className="small">
                  当这些条件长期缺失时，可能更耗精力；实际体验仍需验证。
                </p>
              </section>
            </div>
            <section className="report-card">
              <span className="section-label">07 / 行为记录</span>
              <h2>已有线索与尚待探索</h2>
              {p.evidence.map((e, i) => (
                <div className="evidence-record" key={i}>
                  <h3>
                    {evidenceNames[i]}{" "}
                    <small>{evidenceLevels[e.level]} · 自述</small>
                  </h3>
                  <p>
                    {e.level > 0 ? e.text : "暂未提供经历，不代表缺乏能力。"}
                  </p>
                </div>
              ))}
            </section>
            <section className="task-card">
              <div className="eyebrow">YOUR NEXT 7 DAYS</div>
              <h2>用一次行动，验证一条线索。</h2>
              <p>{r.task}</p>
              <div className="task-steps">
                <p>
                  <b>01 / 选择</b>第一天明确问题与可完成的范围。
                </p>
                <p>
                  <b>02 / 尝试</b>完成一份看得见的产出。
                </p>
                <p>
                  <b>03 / 回看</b>记录投入感、困难与反馈，再更新画像。
                </p>
              </div>
            </section>
            <section className="quality">
              <h3>如何理解这份结果</h3>
              <p>
                有效回答 {r.answered} /
                33；行为经历均未经外部核验。以下仅提示信息完整度，不是心理测量置信度。
              </p>
              {r.flags.map((f) => (
                <p key={f}>· {f}</p>
              ))}
              <p>
                这是一份基于原创探索题和透明规则生成的自我观察记录。它不会确定你的能力、诊断心理状况或决定职业方向。
              </p>
            </section>
            <div className="report-actions">
              <button className="primary" onClick={() => window.print()}>
                打印 / 保存 PDF
              </button>
              <button className="secondary" onClick={exportData}>
                导出我的数据
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setStep(0);
                  navigate("quiz");
                }}
              >
                修改回答与经历
              </button>
              <button className="text-button" onClick={clear}>
                清除全部记录
              </button>
            </div>
            <p className="small no-print">
              导出含你的经历自述，请自行保管。PDF可通过浏览器打印对话框保存。
            </p>
          </div>
        )}
      </main>
      <footer>
        <span>观己 / BUILD YOUR CAREER</span>
        <span>理解此刻的自己，为下一步保留可能。</span>
      </footer>
    </>
  );
}
