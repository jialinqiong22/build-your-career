"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import type { ProgressKind } from "@/lib/progress-validation";
type Snapshot = {
  payload: Record<string, unknown>;
  revision: string;
  updatedAt: string;
};
export default function CloudProgress({
  kind,
  payload,
  onRestore,
}: {
  kind: ProgressKind;
  payload: Record<string, unknown>;
  onRestore: (payload: Record<string, unknown>) => void;
}) {
  const { requireAuth, user } = useAuth();
  const [consent, setConsent] = useState(false);
  const [revision, setRevision] = useState<string | 0>(0);
  const [remote, setRemote] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const latest = useRef(payload);
  latest.current = payload;
  const consentRef = useRef(consent);
  consentRef.current = consent;
  const ownerRef = useRef(user?.id);
  ownerRef.current = user?.id;
  const kindRef = useRef(kind);
  kindRef.current = kind;
  useEffect(() => {
    setRevision(0);
    setRemote(null);
  }, [user?.id, kind]);
  async function act(mode: "read" | "save") {
    if (mode === "save" && !consentRef.current) {
      setMessage("请先明确同意云端保存。");
      return;
    }
    const owner = ownerRef.current;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        mode === "read" ? `/api/progress?kind=${kind}` : "/api/progress",
        mode === "read"
          ? { cache: "no-store" }
          : {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind,
                payload: latest.current,
                revision,
                consent: true,
              }),
            },
      );
      const data = await response.json();
      if (
        (owner !== undefined && owner !== ownerRef.current) ||
        kind !== kindRef.current
      )
        return;
      if (!response.ok) throw new Error(data.error || "云端操作失败。");
      if (mode === "read") {
        setRemote(data.records[0] || null);
        setMessage(
          data.records.length
            ? "已找到云端记录；恢复会替换当前页面答案。"
            : "尚无云端记录。",
        );
      } else {
        setRevision(data.record.revision);
        setRemote(null);
        setMessage("已保存当前版本；后续修改需再次主动保存。");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "网络异常，请重试。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="info-box no-print" aria-label="云端保存">
      <h3>在自己的账号中保存</h3>
      <p>
        仅在点击保存后上传本次测评的答案与填写内容。每种测评保留一份最新记录，可在“我的测评”删除；不会自动上传。
      </p>
      <label className="checkline">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />{" "}
        我同意将当前测评内容保存到账号
      </label>
      <div className="quiz-actions">
        <button
          className="secondary"
          type="button"
          disabled={!consent || busy}
          onClick={() => requireAuth(() => act("save"))}
        >
          保存当前进度到云端
        </button>
        <button
          className="secondary"
          type="button"
          disabled={busy}
          onClick={() => requireAuth(() => act("read"))}
        >
          查看可恢复的云端记录
        </button>
      </div>
      {remote && (
        <div>
          <p>
            云端保存于 {new Date(remote.updatedAt).toLocaleString("zh-CN")}。
          </p>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              try {
                onRestore(remote.payload);
                setRevision(remote.revision);
                setRemote(null);
                setMessage("已恢复云端版本。");
              } catch {
                setMessage("云端记录不兼容，当前答案未替换。");
              }
            }}
          >
            确认用云端记录恢复
          </button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
