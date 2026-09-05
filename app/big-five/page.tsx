"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BigFiveForm from "@/components/BigFiveForm";
import BigFiveResults from "@/components/BigFiveResults";
import PlanCards from "@/components/PlanCards";
import { questions50 } from "@/lib/bigfive/data50";
import { scoreBigFive } from "@/lib/bigfive/scoring";
const KEY = "guanjip-ipip50-1";
export default function FreeBigFive() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({}),
    [started, setStarted] = useState(false),
    [result, setResult] = useState(false),
    [save, setSave] = useState(false),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.entries(parsed).every(
            ([id, v]) =>
              questions50.some((q) => q.id === id) &&
              (v === null ||
                (typeof v === "number" &&
                  Number.isInteger(v) &&
                  v >= 1 &&
                  v <= 5)),
          )
        ) {
          setAnswers(parsed);
          setSave(true);
        } else setNotice("旧记录格式不兼容，已保留原记录，当前从空白开始。");
      }
    } catch {
      setNotice("未能读取本机记录，可以继续测评。");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && save)
      try {
        localStorage.setItem(KEY, JSON.stringify(answers));
      } catch {
        setNotice("本机保存失败；请保持页面开启。");
      }
  }, [answers, ready, save]);
  function clear() {
    if (!confirm("清除这份免费大五测评的回答及本机记录？")) return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      setNotice("删除失败，请在浏览器设置清除此网站数据。");
      return;
    }
    setSave(false);
    setAnswers({});
    setResult(false);
    setStarted(false);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              instrument: "IPIP-50",
              answers,
              scores: scoreBigFive(questions50, answers),
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
    a.download = "观己-IPIP50.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <span className="edition">50题免费版</span>
      </header>
      <main className="standalone">
        <div className="eyebrow">IPIP-50 / 约7分钟</div>
        <h1 className="page-title">认识自己的五个维度</h1>
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {!started ? (
          <>
            <p className="lead">
              50道题，一份大五人格基础画像。按通常的自己回答，不需要猜“正确答案”。
            </p>
            <div className="info-box">
              <p>
                采用公开IPIP-50题目、正反向计分与本项目中文适配。不提供人群排名或心理诊断；约7分钟是体验目标，实际因人而异。
              </p>
              <p>
                回答仅在浏览器处理。默认关闭页面即丢失；选择本机保存后会保留至你清除。无需注册或付费。
              </p>
            </div>
            <label className="checkline">
              <input
                type="checkbox"
                checked={save}
                onChange={(e) => {
                  if (!e.target.checked) {
                    try {
                      localStorage.removeItem(KEY);
                    } catch {
                      setNotice("无法删除记录，请清除网站数据。");
                      return;
                    }
                  }
                  setSave(e.target.checked);
                }}
              />
              在本机保存回答（可选，共用设备请谨慎）
            </label>
            <button
              className="primary"
              disabled={!ready}
              onClick={() => setStarted(true)}
            >
              {Object.keys(answers).length ? "继续测评" : "开始免费测评"} ↗
            </button>
            {questions50.every((q) => Object.hasOwn(answers, q.id)) && (
              <button
                className="secondary"
                onClick={() => {
                  setStarted(true);
                  setResult(true);
                }}
              >
                查看已有结果
              </button>
            )}
          </>
        ) : result ? (
          <>
            <BigFiveResults items={questions50} answers={answers} />
            <div className="report-actions">
              <button className="secondary" onClick={() => setResult(false)}>
                修改回答
              </button>
              <button className="secondary" onClick={download}>
                导出免费结果
              </button>
              <button className="text-button" onClick={clear}>
                清除回答
              </button>
            </div>
            <PlanCards />
          </>
        ) : (
          <BigFiveForm
            items={questions50}
            answers={answers}
            onChange={setAnswers}
            onComplete={() => {
              setResult(true);
              window.scrollTo(0, 0);
            }}
          />
        )}
        <p className="small">
          <a href="/sources">题库来源、适配说明与开源许可</a>
        </p>
      </main>
    </>
  );
}
