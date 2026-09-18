"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { feedbackPrompts } from "@/lib/social-validation";
export default function InviteCreator({
  kind,
  payload,
}: {
  kind: "compare" | "feedback";
  payload: Record<string, unknown>;
}) {
  const [available, setAvailable] = useState<boolean | null>(null),
    [consent, setConsent] = useState(false),
    [message, setMessage] = useState(""),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<
    { token: string; kind: string; expiresAt: string }[]
  >([]);
  const { requireAuth } = useAuth();
  useEffect(() => {
    fetch("/api/social/invites")
      .then((r) => r.json())
      .then((v) => setAvailable(v.configured === true))
      .catch(() => setAvailable(false));
  }, []);
  useEffect(() => {
    try {
      const records = JSON.parse(
        localStorage.getItem("career-social-invites") || "[]",
      );
      if (Array.isArray(records))
        setSaved(
          records.filter(
            (r) =>
              r &&
              typeof r.token === "string" &&
              /^[A-Za-z0-9_-]{43}$/.test(r.token) &&
              r.kind === kind,
          ),
        );
    } catch {
      /* No prior invites. */
    }
  }, [kind]);
  async function create() {
    setBusy(true);
    setMessage("");
    try {
      localStorage.setItem("career-social-storage-check", "1");
      localStorage.removeItem("career-social-storage-check");
      const r = await fetch("/api/social/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...payload, consent }),
      });
      const value = await r.json();
      if (!r.ok) throw Error(value.error);
      localStorage.setItem(`career-social:${value.token}`, value.ownerSecret);
      const rawRecords = JSON.parse(
        localStorage.getItem("career-social-invites") || "[]",
      );
      const records = Array.isArray(rawRecords) ? rawRecords : [];
      const next = [
        ...records,
        { token: value.token, kind, expiresAt: value.expiresAt },
      ].slice(-30);
      localStorage.setItem("career-social-invites", JSON.stringify(next));
      setSaved(next.filter((r) => r.kind === kind));
      setLink(
        `${location.origin}/${kind === "compare" ? "compare" : "feedback"}/${value.token}`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "创建失败，请重试。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="info-box no-print">
      <h3>{kind === "compare" ? "邀请朋友对比" : "邀请他人补充这段经历"}</h3>
      {kind === "compare" ? (
        <p>
          邀请7天内有效。朋友完成大五并同意后，你还需打开邀请作最终确认；双方确认前均看不到对方分数。可随时撤回。分数仅供自我探索，不代表高低优劣。
        </p>
      ) : (
        <>
          <p>
            只分享下方这一条经历摘要，不包含其他测评或账号资料。对方无需注册，回答只作为未经核验的外部补充，不会覆盖你的自述。邀请和回答最多保留30天，可通过邀请页撤回；对方可凭删除凭据删除回答。
          </p>
          <blockquote>{String(payload.summary || "")}</blockquote>
          <ol>
            {feedbackPrompts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </>
      )}
      {available === false ? (
        <p role="status">邀请服务尚未开放。</p>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            我已预览并同意创建上述邀请
          </label>
          <button
            type="button"
            className="secondary"
            disabled={!consent || busy || available !== true}
            onClick={() =>
              kind === "feedback" ? requireAuth(create) : void create()
            }
          >
            {busy ? "正在创建…" : "生成邀请链接"}
          </button>
        </>
      )}
      {link && (
        <>
          <p>
            请自行选择发送对象。保留当前浏览器记录，管理凭据不会包含在分享链接中。
          </p>
          <label>
            邀请链接
            <input value={link} readOnly onFocus={(e) => e.target.select()} />
          </label>
          <a className="secondary" href={link}>
            打开邀请，查看状态或撤回
          </a>
        </>
      )}
      {message && <p role="status">{message}</p>}
      {saved.length > 0 && (
        <details>
          <summary>本机已创建的邀请</summary>
          <ul>
            {saved.map((r) => (
              <li key={r.token}>
                <a
                  href={`/${kind === "compare" ? "compare" : "feedback"}/${r.token}`}
                >
                  查看状态、反馈或撤回
                </a>{" "}
                · 到期 {new Date(r.expiresAt).toLocaleDateString("zh-CN")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
