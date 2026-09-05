"use client";
import { useState } from "react";
import type { BigFiveQuestion } from "@/lib/bigfive/types";
export default function BigFiveForm({
  items,
  answers,
  onChange,
  onComplete,
}: {
  items: readonly BigFiveQuestion[];
  answers: Record<string, number | null>;
  onChange: (answers: Record<string, number | null>) => void;
  onComplete: () => void;
}) {
  const first = items.findIndex((q) => !Object.hasOwn(answers, q.id));
  const [page, setPage] = useState(first < 0 ? 0 : Math.floor(first / 10)),
    [error, setError] = useState("");
  const pageItems = items.slice(page * 10, (page + 1) * 10),
    pages = Math.ceil(items.length / 10);
  const done = items.filter((q) => Object.hasOwn(answers, q.id)).length;
  function move(next: number) {
    if (next > page && pageItems.some((q) => !Object.hasOwn(answers, q.id))) {
      setError("请回答本页每一题；无法判断时可明确跳过。");
      return;
    }
    setError("");
    if (next === pages) {
      onComplete();
      return;
    }
    setPage(next);
    window.scrollTo({ top: 0 });
  }
  return (
    <div className="bigfive-form">
      <div className="assessment-progress" aria-live="polite">
        <span>
          第 {page + 1} / {pages} 页
        </span>
        <span>
          已处理 {done} / {items.length} 题
        </span>
      </div>
      <progress value={done} max={items.length} aria-label="测评完成进度" />
      <p className="small">
        根据通常的自己回答。可以修改答案，跳过不会记作低分；信息不足的维度将不显示分数。
      </p>
      {pageItems.map((q, i) => (
        <fieldset className="question" key={q.id}>
          <legend>
            <span className="question-number">{page * 10 + i + 1}</span>
            {q.text}
          </legend>
          <div className="likert">
            {[
              "非常不符合",
              "不太符合",
              "中立 / 一般",
              "比较符合",
              "非常符合",
            ].map((label, j) => (
              <label
                className={
                  answers[q.id] === j + 1 ? "choice selected" : "choice"
                }
                key={label}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === j + 1}
                  onChange={() => onChange({ ...answers, [q.id]: j + 1 })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <label className="unknown">
            <input
              type="radio"
              name={q.id}
              checked={Object.hasOwn(answers, q.id) && answers[q.id] === null}
              onChange={() => onChange({ ...answers, [q.id]: null })}
            />
            无法判断 / 跳过
          </label>
        </fieldset>
      ))}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="quiz-actions">
        <button
          className="secondary"
          disabled={page === 0}
          onClick={() => move(page - 1)}
        >
          ← 上一页
        </button>
        <button className="primary" onClick={() => move(page + 1)}>
          {page === pages - 1 ? "完成大五测评" : "下一页"} ↗
        </button>
      </div>
    </div>
  );
}
