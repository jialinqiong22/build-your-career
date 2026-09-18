"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { validScores, type SocialScores } from "@/lib/social-validation";
type View = {
  kind: "compare" | "feedback";
  status: string;
  role: "owner" | "participant" | "visitor";
  expiresAt: string;
  summary?: string;
  prompts?: string[];
  answers?: string[];
  initiatorScores?: SocialScores;
  inviteeScores?: SocialScores;
};
const names = {
  O: "开放性",
  C: "尽责性",
  E: "外向性",
  A: "宜人性",
  N: "情绪敏感性",
};
const states: Record<string, string> = {
  pending_assessment: "等待朋友完成测评并确认",
  pending_initiator_consent: "等待发起人最终确认",
  active: "双方已同意",
  declined: "已拒绝",
  revoked: "已撤回",
  expired: "已到期",
  open: "等待反馈",
  submitted: "反馈已提交",
  closed: "已关闭",
};
export default function SocialInvite({ token }: { token: string }) {
  const [view, setView] = useState<View | null>(null),
    [error, setError] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [answers, setAnswers] = useState(["", "", ""]),
    [preview, setPreview] = useState(false),
    [receipt, setReceipt] = useState("");
  const { requireAuth, user } = useAuth();
  const request = useCallback(
    async (data?: Record<string, unknown>) => {
      const secret = localStorage.getItem(`career-social:${token}`) || "";
      const r = await fetch(`/api/social/invites/${token}`, {
        method: data ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-social-secret": secret } : {}),
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
      });
      const value = await r.json();
      if (!r.ok) throw Error(value.error);
      if (value.participantSecret)
        localStorage.setItem(`career-social:${token}`, value.participantSecret);
      if (value.receipt) {
        localStorage.setItem(`career-feedback-receipt:${token}`, value.receipt);
        setReceipt(value.receipt);
      }
      if (value.kind) setView(value);
      return value;
    },
    [token],
  );
  const refresh = useCallback(() => {
    setError("");
    return request().catch((e) => {
      setView(null);
      setError(e.message);
    });
  }, [request]);
  useEffect(() => {
    void refresh();
    try {
      setReceipt(
        localStorage.getItem(`career-feedback-receipt:${token}`) || "",
      );
    } catch {
      setError("请允许本机存储以保留邀请管理凭据。");
    }
  }, [refresh, user, token]);
  async function action(action: string) {
    setBusy(true);
    setError("");
    try {
      const scores =
        action === "join"
          ? JSON.parse(localStorage.getItem("career-social-scores") || "null")
          : null;
      if (action === "join" && !validScores(scores))
        throw Error("请先完成免费大五，然后回到此页。");
      await request({
        action,
        consent,
        ...(action === "join" ? { scores } : {}),
        ...(action === "respond" ? { answers } : {}),
        ...(action === "delete_response" ? { receipt } : {}),
      });
      if (action === "delete_response") {
        localStorage.removeItem(`career-feedback-receipt:${token}`);
        setReceipt("");
        await refresh();
      }
      setConsent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败。");
    } finally {
      setBusy(false);
    }
  }
  const closed =
    view && ["revoked", "declined", "expired", "closed"].includes(view.status);
  return (
    <main className="standalone">
      <Link href="/">观己 · 返回首页</Link>
      <h1>
        {view?.kind === "feedback" ? "关于一段具体经历的反馈" : "邀请对比"}
      </h1>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {!view && (
        <button className="secondary" onClick={() => requireAuth(refresh)}>
          登录后重试
        </button>
      )}
      {view && (
        <>
          <p>
            {states[view.status] || view.status} · 到期时间{" "}
            {new Date(view.expiresAt).toLocaleString("zh-CN")}
          </p>
          <button className="text-button" onClick={() => void refresh()}>
            刷新状态
          </button>
          {view.kind === "compare" && !closed && (
            <>
              {view.role === "visitor" &&
                view.status === "pending_assessment" && (
                  <>
                    <p>
                      打开邀请不会展示任何一方的分数。先完成免费大五，再返回此页确认。确认后仍需发起人同意才可互看。邀请链接7天到期，可拒绝或随时撤回；已被保存的结果无法远程删除。
                    </p>
                    <a href="/big-five" target="_blank" rel="noreferrer">
                      在新窗口完成免费大五
                    </a>
                    <label>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      我同意向发起人展示我的五维分数并查看对方结果
                    </label>
                    <button
                      className="primary"
                      disabled={!consent || busy}
                      onClick={() => void action("join")}
                    >
                      提交同意，等待对方确认
                    </button>
                    <Link className="secondary" href="/">
                      不同意，离开邀请
                    </Link>
                  </>
                )}
              {view.role === "owner" &&
                view.status === "pending_initiator_consent" && (
                  <>
                    <p>
                      朋友已完成并同意。最终确认后，双方可看到彼此的五维分数。
                    </p>
                    <label>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      我同意双方互看五维分数
                    </label>
                    <button
                      className="primary"
                      disabled={!consent || busy}
                      onClick={() => void action("confirm")}
                    >
                      最终确认
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => void action("decline")}
                    >
                      拒绝对比
                    </button>
                  </>
                )}
              {view.initiatorScores && view.inviteeScores && (
                <>
                  <table>
                    <caption>五维分数（0—100响应量尺，非人群百分位）</caption>
                    <thead>
                      <tr>
                        <th>维度</th>
                        <th>发起人</th>
                        <th>受邀人</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(names).map(([key, name]) => (
                        <tr key={key}>
                          <th>{name}</th>
                          <td>
                            {view.initiatorScores![key as keyof SocialScores]}
                          </td>
                          <td>
                            {view.inviteeScores![key as keyof SocialScores]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>差异只提供讨论起点，不表示谁更好或更适合某项工作。</p>
                </>
              )}
            </>
          )}
          {view.kind === "feedback" && !closed && (
            <>
              <h2>本次经历摘要</h2>
              <blockquote>{view.summary}</blockquote>
              <p>
                仅这条经历会被分享。请勿填写第三方敏感信息。反馈为未经核验的外部补充，最多保留至上方到期时间；提交后可凭本机保存的删除凭据删除。
              </p>
              {view.role === "owner" && view.answers && (
                <section>
                  <h2>他人反馈（未经核验）</h2>
                  {view.answers.map((a, i) => (
                    <p key={i}>
                      <b>{view.prompts?.[i]}</b>
                      <br />
                      {a}
                    </p>
                  ))}
                </section>
              )}
              {view.role === "visitor" && view.status === "open" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPreview(true);
                  }}
                >
                  {view.prompts?.map((p, i) => (
                    <label className="field-label" key={p}>
                      {p}
                      <textarea
                        required
                        minLength={2}
                        maxLength={1000}
                        value={answers[i]}
                        onChange={(e) => {
                          setPreview(false);
                          setAnswers((a) =>
                            a.map((v, j) => (i === j ? e.target.value : v)),
                          );
                        }}
                      />
                    </label>
                  ))}
                  <button className="secondary" type="submit">
                    预览将保存的内容
                  </button>
                  {preview && (
                    <section>
                      <h3>提交前预览</h3>
                      {answers.map((a, i) => (
                        <p key={i}>{a}</p>
                      ))}
                      <label>
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        我同意以上回答向发起人展示，并按说明保存
                      </label>
                      <button
                        type="button"
                        className="primary"
                        disabled={!consent || busy}
                        onClick={() => void action("respond")}
                      >
                        确认提交反馈
                      </button>
                    </section>
                  )}
                </form>
              )}
            </>
          )}
          {!closed && view.role !== "visitor" && (
            <button
              className="secondary"
              disabled={busy}
              onClick={() => void action("revoke")}
            >
              撤回邀请 / 同意
            </button>
          )}
          {view.role === "owner" && !closed && view.kind === "compare" && (
            <button
              className="text-button"
              onClick={() => requireAuth(() => action("bind"))}
            >
              绑定到当前登录账号
            </button>
          )}
        </>
      )}
      {view?.kind === "feedback" && view.role === "visitor" && (
        <section>
          <p>
            提交后，回答删除凭据会保存在本浏览器，请勿分享。你也可以粘贴此前自行保存的凭据来删除回答。
          </p>
          <label className="field-label">
            回答删除凭据
            <input
              autoComplete="off"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              maxLength={43}
            />
          </label>
          <button
            className="secondary"
            disabled={busy || !receipt}
            onClick={() => void action("delete_response")}
          >
            删除我提交的反馈
          </button>
        </section>
      )}
    </main>
  );
}
