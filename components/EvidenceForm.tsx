"use client";
import {
  blankEvidence,
  evidenceCategories,
  evidenceFields,
  type Evidence,
  type EvidenceField,
} from "@/lib/evidence";
export default function EvidenceForm({
  entries,
  onChange,
}: {
  entries: Evidence[];
  onChange: (e: Evidence[]) => void;
}) {
  function update(index: number, patch: Partial<Evidence>) {
    onChange(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  return (
    <>
      <p className="lead">
        没有经历也可以。我们问的是你实际做过什么，不是让你给自己的能力打分。
      </p>
      <p className="small">
        每类填写一段最有代表性的经历即可。同一项目不要拆成多条重复填写。字段不确定可留空，留空只表示信息不足。请勿填写他人的姓名、联系方式或机密材料。
      </p>
      {entries.map((e, i) => (
        <section className="evidence-form" key={evidenceCategories[i]}>
          <h3>{evidenceCategories[i]}</h3>
          <label className="field-label">
            这类经历目前的情况
            <select
              value={e.status}
              onChange={(event) => {
                const status = event.target.value as Evidence["status"];
                onChange(
                  entries.map((x, j) =>
                    j !== i
                      ? x
                      : status === "some"
                        ? { ...x, status }
                        : { ...blankEvidence(), status },
                  ),
                );
              }}
            >
              <option value="unanswered">请选择，也可以明确没有经历</option>
              <option value="none">暂时没有 / 不提供这类经历</option>
              <option value="some">有一段经历想记录</option>
            </select>
          </label>
          {e.status === "some" &&
            Object.entries(evidenceFields).map(([key, label]) => (
              <label className="field-label" key={key}>
                {label}
                <textarea
                  maxLength={400}
                  value={e[key as EvidenceField]}
                  onChange={(event) => update(i, { [key]: event.target.value })}
                  placeholder={
                    key === "action"
                      ? "例如：我重新整理了数据口径，比较两种方法并记录差异。"
                      : key === "duration"
                        ? "例如：连续两周，每周一次；一下午的尝试也可以。"
                        : "只写你知道的内容，不确定可以留空。"
                  }
                />
              </label>
            ))}
        </section>
      ))}
    </>
  );
}
