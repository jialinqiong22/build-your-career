"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  blank,
  KEY,
  VERSION,
  validProfile,
  finished,
  completion,
  report,
  stages,
  directions,
  type Profile,
  type SuiteBanks,
} from "@/lib/positioning";
import { valueQuestions, valueNames } from "@/lib/values";
import { hollandQuestions } from "@/lib/instruments";
import Questionnaire from "./Questionnaire";
import EvidenceForm from "./EvidenceForm";
import SuiteReport from "./SuiteReport";
const titles = [
  "开始之前",
  "职业价值观",
  "霍兰德职业兴趣",
  "大五人格",
  "潜力证据与成长条件",
  "九型人格（可选）",
];
const fit = ["非常不符合", "不太符合", "中立 / 一般", "比较符合", "非常符合"];
export default function PositioningSuite({
  previewBanks,
}: {
  previewBanks?: SuiteBanks;
}) {
  const preview = Boolean(previewBanks);
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      generation.current++;
      pending.current?.abort();
    },
    [],
  );
  const [banks, setBanks] = useState<SuiteBanks | null>(previewBanks ?? null),
    [p, setP] = useState<Profile>(blank),
    [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [save, setSave] = useState(false),
    [consent, setConsent] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [view, setView] = useState<"quiz" | "report">("quiz"),
    [result, setResult] = useState<ReturnType<typeof report> | null>(null),
    [revision, setRevision] = useState(0),
    [expired, setExpired] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const b =
          previewBanks ??
          (await fetch("/api/premium/bank", { cache: "no-store" }).then(
            async (r) => {
              if (!r.ok) throw Error("请先兑换199元套餐，再进入完整测评。");
              return r.json();
            },
          ));
        if (cancelled) return;
        setBanks(b);
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) {
            const stored = JSON.parse(raw);
            if (validProfile(stored, b)) {
              setP(stored);
              setSave(true);
              setNotice(
                "已恢复本机记录。旧版V3不会自动转换，新旧记录分开保存。",
              );
            } else
              setNotice(
                "发现不兼容或损坏的V4记录，未载入；可先清除记录再重新作答。",
              );
          }
        } catch {
          setNotice("无法读取本机记录，可以继续页面内作答。");
        }
      } catch (e) {
        if (!cancelled)
          setNotice(e instanceof Error ? e.message : "暂时无法连接套餐服务。");
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [previewBanks]);
  useEffect(() => {
    if (!ready || !save || !banks) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      setNotice("本机保存失败，请保持页面开启并及时导出。");
    }
  }, [p, ready, save, banks]);
  function change(next: Profile) {
    cancelGeneration();
    setP(next);
    setResult(null);
  }
  function navigate(n: number) {
    cancelGeneration();
    setStep(n);
    setView("quiz");
    setError("");
    setRevision((x) => x + 1);
    window.scrollTo(0, 0);
  }
  function next() {
    navigate(step + 1);
  }
  function clear() {
    if (!confirm("清除本次V4测评及本机V4记录？旧版与免费大五记录不受影响。"))
      return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      setNotice("删除失败，请在浏览器设置清除此站点数据。");
      return;
    }
    setSave(false);
    setP(blank());
    setResult(null);
    setConsent(false);
    setNotice("本次V4记录已清除。");
    navigate(0);
  }
  function toggleSave(checked: boolean) {
    if (!checked) {
      try {
        localStorage.removeItem(KEY);
      } catch {
        setNotice("无法删除本机记录，请清除网站数据。");
        return;
      }
    }
    setSave(checked);
  }
  function cancelGeneration() {
    generation.current++;
    pending.current?.abort();
    pending.current = null;
    setBusy(false);
  }
  async function generate() {
    if (pending.current) return;
    if (!banks || !finished(p, banks)) {
      setError(
        "请完成四项基础模块，并选择完成或跳过九型。每道题都可以明确跳过。",
      );
      return;
    }
    setBusy(true);
    setError("");
    const requestId = ++generation.current;
    const controller = new AbortController();
    pending.current = controller;
    try {
      if (preview) setResult(report(p, banks));
      else {
        const response = await fetch("/api/premium/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
          signal: controller.signal,
        });
        if (requestId !== generation.current) return;
        if (!response.ok) {
          if (response.status === 403) setExpired(true);
          const data = await response.json();
          throw Error(data.error || "报告生成失败。");
        }
        const data = await response.json();
        if (requestId !== generation.current) return;
        setResult(data.report);
      }
      if (requestId !== generation.current) return;
      setView("report");
      setExpired(false);
      window.scrollTo(0, 0);
    } catch (e) {
      if (requestId !== generation.current) return;
      setError(e instanceof Error ? e.message : "网络异常，回答仍保留。");
    } finally {
      if (requestId === generation.current) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  async function print() {
    try {
      if (!preview) {
        const response = await fetch("/api/premium/access", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!data.active) {
          setExpired(true);
          setNotice("访问已到期，请重新兑换；回答仍在当前页面。");
          return;
        }
      }
      window.print();
      setExpired(false);
    } catch {
      setNotice("无法验证访问状态，请重试。");
    }
  }
  function exportData() {
    if (!banks) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              version: VERSION,
              profile: p,
              report: report(p, banks),
              optional:
                p.enneagramChoice === "take" ? p.enneagramAnswers : null,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "观己-个人定位V4.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const done = banks ? completion(p, banks) : [];
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <span className="edition">四维基础 · 一项可选</span>
      </header>
      <main>
        {preview && (
          <div className="notice preview-banner">
            仅本机开发验收：无需付款，未产生订单。此入口在生产环境关闭。
          </div>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {expired && (
          <p className="notice">
            <Link href="/premium" target="_blank">
              在新标签页重新兑换
            </Link>
            ，成功后回到本页重试。未选择本机保存时请勿刷新本页。
          </p>
        )}
        {!ready ? (
          <p>正在准备测评…</p>
        ) : !banks ? (
          <section className="standalone">
            <h1>完整定位服务</h1>
            <p>付费访问需要有效兑换码；登录GitHub与完成测评无关。</p>
            <Link className="primary" href="/premium">
              查看套餐 / 兑换
            </Link>
            <button className="text-button" onClick={clear}>
              清除本机V4记录
            </button>
          </section>
        ) : view === "report" && result ? (
          <>
            <SuiteReport profile={p} banks={banks} result={result} />
            <div className="report-actions">
              <button className="primary" onClick={print}>
                打印 / 保存 PDF
              </button>
              <button className="secondary" onClick={exportData}>
                导出我的数据
              </button>
              <button className="secondary" onClick={() => navigate(0)}>
                修改回答与经历
              </button>
              <button className="text-button" onClick={clear}>
                清除本机V4记录
              </button>
            </div>
            <p className="small no-print">
              PDF通过浏览器“另存为PDF”保存。报告包含个人自述，请妥善保管。
            </p>
          </>
        ) : (
          <div className="assessment-layout">
            <aside className="step-sidebar">
              <div className="eyebrow">YOUR EXPLORATION</div>
              <h2>
                认识自己，
                <br />
                保留可能。
              </h2>
              <nav aria-label="模块导航">
                {titles.map((title, i) => (
                  <button
                    type="button"
                    className={step === i ? "module-nav active" : "module-nav"}
                    key={title}
                    onClick={() => navigate(i)}
                    disabled={i > 0 && !consent}
                  >
                    <span>
                      {i === 0 ? "开始" : done[i - 1] ? "✓" : `0${i}`}
                    </span>
                    {title}
                  </button>
                ))}
              </nav>
              <p className="small">
                可切换模块、分次完成。跳过问题不计低分；九型可整项跳过。
              </p>
            </aside>
            <section className="quiz-panel">
              <div className="eyebrow">
                {step === 0 ? "准备开始" : `模块 ${step} / 5`}
              </div>
              <h1>{titles[step]}</h1>
              {step === 0 && (
                <>
                  <p className="lead">
                    四项基础信息分开解读，第五项仅补充动机。不需要已有实习，也不生成唯一职业答案。
                  </p>
                  <div className="info-box">
                    <p>
                      原创职业价值观40题、霍兰德{hollandQuestions.length}
                      题、大五120题、五类经历记录，以及可选九型
                      {banks.enneagram.length}
                      题。请分次完成，完整套餐不是七分钟测试。
                    </p>
                    <p>
                      生成正式报告时，回答会提交本站服务器用于校验和计算，不写入应用数据库。默认仅页面暂存，选择本机保存后保留至你清除。套餐凭证使用HttpOnly
                      Cookie。报告由你决定是否分享。
                    </p>
                    <p>
                      题目可选无法判断；证据分档只描述填写完整度，不测谎、不评价学历或个人能力。
                    </p>
                  </div>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    我已了解用途、局限和数据处理方式。
                  </label>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={save}
                      onChange={(e) => toggleSave(e.target.checked)}
                    />
                    在本机保存进度（可选，共用设备请谨慎）
                  </label>
                  <label className="field-label">
                    目前阶段
                    <select
                      value={p.stage}
                      onChange={(e) => change({ ...p, stage: e.target.value })}
                    >
                      {stages.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    方向清晰度
                    <select
                      value={p.direction}
                      onChange={(e) =>
                        change({ ...p, direction: e.target.value })
                      }
                    >
                      {directions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    想探索的方向，或已知不喜欢的条件（可选）
                    <textarea
                      maxLength={200}
                      value={p.target}
                      onChange={(e) => change({ ...p, target: e.target.value })}
                    />
                  </label>
                  <div className="quiz-actions">
                    <button
                      className="primary"
                      disabled={!consent}
                      onClick={next}
                    >
                      开始职业价值观 ↗
                    </button>
                    <button className="text-button" onClick={clear}>
                      清除本机V4记录
                    </button>
                  </div>
                  {done.every(Boolean) && (
                    <button
                      className="secondary"
                      disabled={busy || !consent}
                      onClick={generate}
                    >
                      查看 / 更新完整报告
                    </button>
                  )}
                </>
              )}
              {step === 1 && (
                <>
                  <p className="lead">
                    以下条件对你选择学习、项目或未来工作有多重要？
                  </p>
                  <p className="small">
                    本项目原创40题，不是施恩原版。按重要程度回答，不是在判断自己目前是否已拥有这些条件。
                  </p>
                  <Questionnaire
                    key={`values-${revision}`}
                    title="职业价值观"
                    items={valueQuestions}
                    answers={p.answers}
                    onChange={(answers) => change({ ...p, answers })}
                    labels={[
                      "很不重要",
                      "不太重要",
                      "一般重要",
                      "比较重要",
                      "非常重要",
                    ]}
                    onComplete={() => {
                      if (p.priorities.length !== 3) {
                        setError("请在下方依次选择三个当前最希望保留的诉求。");
                        document.getElementById("priorities")?.scrollIntoView();
                      } else next();
                    }}
                  />
                  <section id="priorities" className="info-box">
                    <h3>不能全部满足时，依次保留哪三项？</h3>
                    <div className="value-grid">
                      {valueNames.map((v) => (
                        <button
                          key={v}
                          className={
                            p.priorities.includes(v)
                              ? "value selected"
                              : "value"
                          }
                          aria-pressed={p.priorities.includes(v)}
                          disabled={
                            p.priorities.length === 3 &&
                            !p.priorities.includes(v)
                          }
                          onClick={() =>
                            change({
                              ...p,
                              priorities: p.priorities.includes(v)
                                ? p.priorities.filter((x) => x !== v)
                                : [...p.priorities, v],
                            })
                          }
                        >
                          {p.priorities.includes(v)
                            ? p.priorities.indexOf(v) + 1
                            : "＋"}{" "}
                          {v}
                        </button>
                      ))}
                    </div>
                    <p>
                      当前顺序：{p.priorities.join(" → ") || "尚未选择"}
                      。点击已选项可取消。
                    </p>
                    {done[0] && (
                      <button className="primary" onClick={next}>
                        进入霍兰德职业兴趣 ↗
                      </button>
                    )}
                  </section>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="lead">
                    假设有机会尝试，你有多喜欢这些活动？不要按现在做得好不好回答。
                  </p>
                  <Questionnaire
                    key={`holland-${revision}`}
                    title="霍兰德职业兴趣"
                    items={hollandQuestions}
                    answers={p.answers}
                    onChange={(answers) => change({ ...p, answers })}
                    labels={[
                      "很不喜欢",
                      "不太喜欢",
                      "一般",
                      "比较喜欢",
                      "很喜欢",
                    ]}
                    onComplete={next}
                  />
                </>
              )}
              {step === 3 && (
                <>
                  <p className="lead">
                    回想通常的自己，而不是理想中的自己。此模块独立于免费50题，需要重新作答。
                  </p>
                  <Questionnaire
                    key={`bigfive-${revision}`}
                    title="大五人格"
                    items={banks.bigFive}
                    answers={p.answers}
                    onChange={(answers) => change({ ...p, answers })}
                    labels={fit}
                    onComplete={next}
                  />
                </>
              )}
              {step === 4 && (
                <>
                  <EvidenceForm
                    entries={p.evidence}
                    onChange={(evidence) => change({ ...p, evidence })}
                  />
                  <button
                    className="primary"
                    onClick={() => {
                      if (!done[3])
                        setError("请为每类经历选择有经历或暂不提供。");
                      else next();
                    }}
                  >
                    进入可选九型 ↗
                  </button>
                </>
              )}
              {step === 5 && (
                <>
                  <p className="lead">
                    九型仅用于动机反思，可跳过，不改变前四项计分、证据分档和报告摘要。
                  </p>
                  <div className="quiz-actions">
                    <button
                      className="secondary"
                      aria-pressed={p.enneagramChoice === "skip"}
                      onClick={() => {
                        change({
                          ...p,
                          enneagramChoice: "skip",
                          enneagramAnswers: {},
                        });
                        setError("");
                      }}
                    >
                      跳过九型，保留基础画像
                    </button>
                    <button
                      className="primary"
                      aria-pressed={p.enneagramChoice === "take"}
                      disabled={!banks.enneagram.length}
                      onClick={() => change({ ...p, enneagramChoice: "take" })}
                    >
                      选择九型动机补充
                    </button>
                  </div>
                  {p.enneagramChoice === "skip" && (
                    <p>已跳过。已有九型回答会被移除，不进入报告。</p>
                  )}
                  {p.enneagramChoice === "take" && (
                    <Questionnaire
                      key={`enneagram-${revision}`}
                      title="九型动机补充"
                      items={banks.enneagram}
                      answers={p.enneagramAnswers}
                      onChange={(enneagramAnswers) =>
                        change({ ...p, enneagramAnswers })
                      }
                      labels={fit}
                      onComplete={generate}
                    />
                  )}
                  <div className="info-box">
                    <h3>生成前检查</h3>
                    <ul>
                      {titles.slice(1).map((t, i) => (
                        <li key={t}>
                          {done[i] ? "✓" : "待完成"} {t}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="primary"
                      disabled={busy || !done.every(Boolean)}
                      onClick={generate}
                    >
                      {busy ? "正在生成…" : "生成完整个人画像"}
                    </button>
                  </div>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              {step > 0 && (
                <button
                  className="text-button"
                  onClick={() => navigate(step - 1)}
                >
                  ← 上一个模块
                </button>
              )}
            </section>
          </div>
        )}
      </main>
      <footer>
        <span>观己 / BUILD YOUR CAREER</span>
        <Link href="/sources">来源、许可与方法</Link>
      </footer>
    </>
  );
}
