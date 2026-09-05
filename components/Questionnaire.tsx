"use client";
import { useState } from "react";
export type Item = { id: string; text: string };
export default function Questionnaire({
  items,
  answers,
  onChange,
  onComplete,
  labels,
  title,
}: {
  items: readonly Item[];
  answers: Record<string, number | null>;
  onChange: (a: Record<string, number | null>) => void;
  onComplete: () => void;
  labels: readonly string[];
  title: string;
}) {
  const first = items.findIndex((q) => !Object.hasOwn(answers, q.id));
  const [page, setPage] = useState(first < 0 ? 0 : Math.floor(first / 10)),
    [error, setError] = useState("");
  const pages = Math.ceil(items.length / 10),
    shown = items.slice(page * 10, page * 10 + 10),
    done = items.filter((q) => Object.hasOwn(answers, q.id)).length;
  function next() {
    if (shown.some((q) => !Object.hasOwn(answers, q.id))) {
      setError("请回答本页每一题，或者明确选择无法判断。");
      return;
    }
    setError("");
    if (page + 1 === pages) onComplete();
    else {
      setPage(page + 1);
      window.scrollTo(0, 0);
    }
  }
  return (
    <div className="bigfive-form">
      <div className="assessment-progress">
        <span>
          {title} · 第{page + 1}/{pages}页
        </span>
        <span>
          已处理{done}/{items.length}题
        </span>
      </div>
      <progress
        aria-label={`${title}完成进度`}
        value={done}
        max={items.length}
      />
      {shown.map((q, i) => (
        <fieldset className="question" key={q.id}>
          <legend>
            <span className="question-number">{page * 10 + i + 1}</span>
            {q.text}
          </legend>
          <div className="likert">
            {labels.map((label, j) => (
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
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="quiz-actions">
        <button
          className="secondary"
          disabled={page === 0}
          onClick={() => {
            setPage(page - 1);
            setError("");
            window.scrollTo(0, 0);
          }}
        >
          ← 上一页
        </button>
        <button className="primary" onClick={next}>
          {page + 1 === pages ? "完成本模块" : "下一页"} ↗
        </button>
      </div>
    </div>
  );
}
