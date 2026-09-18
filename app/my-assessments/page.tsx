"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
type RecordRow = {
  kind: "free50" | "suite50" | "suite120";
  revision: string;
  updatedAt: string;
};
const titles = {
  free50: "免费大五50题",
  suite50: "完整四维（大五50题）",
  suite120: "完整四维（大五120题）",
};
export default function MyAssessments() {
  const { user, loading, requireAuth } = useAuth();
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteStage, setDeleteStage] = useState<"idle" | "confirm">("idle");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
    setRecords([]);
    if (!user) return;
    const controller = new AbortController();
    fetch("/api/progress", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRecords(data.records);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message || "加载失败。");
      });
    return () => controller.abort();
  }, [user]);
  async function remove(row: RecordRow) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: row.kind, revision: row.revision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRecords((current) =>
        current.filter((record) => record.kind !== row.kind),
      );
      setConfirm(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "删除失败。");
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount() {
    if (!deletePassword) {
      setDeleteError("请输入密码以确认注销。");
      return;
    }
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "暂时无法注销账号，请稍后重试。",
        );
      window.location.assign("/");
    } catch (cause) {
      setDeleteError(
        cause instanceof Error ? cause.message : "网络连接异常，请稍后重试。",
      );
    } finally {
      setDeleteBusy(false);
    }
  }
  return (
    <main className="standalone">
      <Link href="/">← 返回首页</Link>
      <h1>我的测评</h1>
      <p>
        这里显示你主动保存的各类测评最新版本。恢复后可继续答题；删除云端记录不会删除本机记录。
      </p>
      {loading ? (
        <p>正在确认账号…</p>
      ) : !user ? (
        <button
          type="button"
          className="primary"
          onClick={() => requireAuth(() => {})}
        >
          登录查看自己的记录
        </button>
      ) : records.length ? (
        records.map((row) => (
          <section className="info-box" key={row.kind}>
            <h2>{titles[row.kind]}</h2>
            <p>保存于 {new Date(row.updatedAt).toLocaleString("zh-CN")}</p>
            <Link href={row.kind === "free50" ? "/big-five" : "/assessment"}>
              进入测评并选择恢复云端记录 →
            </Link>
            {confirm === row.kind ? (
              <div>
                <p>确定删除这份云端记录？删除后无法从云端恢复。</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(row)}
                >
                  确认删除
                </button>
                <button type="button" onClick={() => setConfirm(null)}>
                  取消
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirm(row.kind)}>
                删除云端记录
              </button>
            )}
          </section>
        ))
      ) : (
        <p>暂未保存云端记录。完成测评时可主动选择保存。</p>
      )}
      {user && (
        <section className="info-box" aria-label="账号与数据">
          <h2>账号与数据</h2>
          <p>
            当前登录：{user.username}。注销账号会立即删除账号本身、全部云端测评记录和相关社交数据，且无法恢复；本机保存的答案不受影响。
          </p>
          {deleteStage === "idle" ? (
            <button type="button" onClick={() => setDeleteStage("confirm")}>
              注销账号…
            </button>
          ) : (
            <div>
              <p role="alert">
                <strong>此操作不可恢复。</strong>
                请输入登录密码，确认注销 {user.username}：
              </p>
              <input
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                aria-label="登录密码"
                style={{
                  padding: "11px 12px",
                  border: "1px solid #b9c4e2",
                  borderRadius: 3,
                  maxWidth: 320,
                }}
              />
              {deleteError && (
                <p role="alert" style={{ color: "#803d2b" }}>
                  {deleteError}
                </p>
              )}
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  disabled={deleteBusy || !deletePassword}
                  onClick={() => void deleteAccount()}
                >
                  {deleteBusy ? "正在注销…" : "永久注销账号"}
                </button>
                <button
                  type="button"
                  disabled={deleteBusy}
                  onClick={() => {
                    setDeleteStage("idle");
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  style={{ marginLeft: 12 }}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </section>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
