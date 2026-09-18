"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./auth.module.css";

export default function PasswordResetForm() {
  const [step, setStep] = useState<"code" | "details">("code");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [retryUntil, setRetryUntil] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const submitting = useRef(false);
  const turnstile = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!retryUntil) return;
    const tick = () =>
      setSeconds(Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [retryUntil]);

  function countdownFrom(response: Response) {
    if (response.status !== 429) return;
    const retry = response.headers.get("Retry-After");
    const delay =
      retry && /^\d+$/.test(retry)
        ? Number(retry) * 1000
        : retry
          ? Date.parse(retry) - Date.now()
          : 60000;
    const wait = Number.isFinite(delay) ? Math.max(1000, delay) : 60000;
    setSeconds(Math.ceil(wait / 1000));
    setRetryUntil(Date.now() + wait);
  }

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || seconds > 0) return;
    setError("");
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/auth/verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          identifier: email.trim(),
          purpose: "password_reset",
          turnstileToken,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        countdownFrom(response);
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "暂时无法发送验证码，请稍后重试。",
        );
      }
      setTurnstileToken("");
      turnstile.current?.reset();
      setStep("details");
    } catch (cause) {
      setTurnstileToken("");
      turnstile.current?.reset();
      setError(
        cause instanceof Error ? cause.message : "网络连接异常，请稍后重试。",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (
      [...password].length < 12 ||
      new TextEncoder().encode(password).length > 72
    ) {
      setError(
        "密码至少 12 个字符，且不超过 72 个 UTF-8 字节；中文字符会占用更多字节。",
      );
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致，请重新确认。");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          identifier: email.trim(),
          emailCode: emailCode.trim(),
          password,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        countdownFrom(response);
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "暂时无法完成重置，请稍后重试。",
        );
      }
      setDone(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "网络连接异常，请稍后重试。",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (done) {
    return (
      <section className={styles.card} aria-label="密码重置完成">
        <div className={styles.cardHeading}>
          <span className="eyebrow">03 / RESET DONE</span>
          <h2>密码已重置</h2>
        </div>
        <p className={styles.help}>
          你的密码已更新，所有已登录的设备都已退出。请使用新密码重新登录。
        </p>
        <Link
          href="/login"
          className={`primary ${styles.submit}`}
          style={{ display: "block", textAlign: "center", padding: "11px 0" }}
        >
          去登录 →
        </Link>
      </section>
    );
  }

  const turnstileWidget = turnstileSiteKey ? (
    <div className={styles.turnstile}>
      <Turnstile
        ref={turnstile}
        siteKey={turnstileSiteKey}
        onSuccess={(token) => {
          setTurnstileToken(token);
          setError("");
        }}
        onExpire={() => setTurnstileToken("")}
        onTimeout={() => setTurnstileToken("")}
        onError={(code) => {
          setTurnstileToken("");
          setError(
            String(code) === "110200"
              ? "当前访问域名尚未加入人机验证白名单，请联系管理员。"
              : "人机验证暂时无法完成，请刷新后重试。",
          );
          return true;
        }}
        onUnsupported={() => {
          setTurnstileToken("");
          setError("当前浏览器无法完成人机验证，请更换浏览器后重试。");
        }}
        options={{
          action: "code",
          language: "zh-cn",
          responseField: false,
          size: "flexible",
          theme: "light",
        }}
      />
    </div>
  ) : (
    <p className={styles.error} role="alert">
      邮箱验证尚未配置，请稍后再试。
    </p>
  );

  return (
    <section className={styles.card} aria-label="重置密码表单">
      <div className={styles.cardHeading}>
        <span className="eyebrow">03 / RESET PASSWORD</span>
        <h2>{step === "code" ? "重置密码" : "重置密码 · 第 2 步"}</h2>
      </div>
      {step === "code" ? (
        <form onSubmit={sendCode} aria-busy={pending}>
          <fieldset className={styles.fields} disabled={pending}>
            <label className={styles.field}>
              注册邮箱
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <span className={styles.help}>
                我们会向这个邮箱发送 6 位验证码。验证码 10 分钟内有效。
              </span>
            </label>
          </fieldset>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {seconds > 0 && (
            <p className={styles.help} role="status">
              操作过于频繁，请在 {seconds} 秒后重试。
            </p>
          )}
          {turnstileWidget}
          <button
            className={`primary ${styles.submit}`}
            disabled={pending || seconds > 0 || !turnstileSiteKey || !turnstileToken}
            type="submit"
          >
            {pending ? "正在发送…" : "发送验证码 →"}
          </button>
          <p className={styles.help}>
            为保护账号隐私，无论邮箱是否注册，页面提示都相同。
          </p>
        </form>
      ) : (
        <form onSubmit={submit} aria-busy={pending}>
          <fieldset className={styles.fields} disabled={pending}>
            <label className={styles.field}>
              邮箱验证码
              <input
                name="email-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
              <span className={styles.help}>
                已发送至 {email}。{" "}
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => {
                    setEmailCode("");
                    setStep("code");
                  }}
                >
                  返回修改邮箱或重新发送
                </button>
              </span>
            </label>
            <label className={styles.field}>
              新密码
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="reset-password-help"
              />
              <span id="reset-password-help" className={styles.help}>
                至少 12 个字符，最多 72 个 UTF-8
                字节。中文字符占用更多字节；首尾空格也属于密码。
              </span>
            </label>
            <label className={styles.field}>
              再次输入新密码
              <input
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          </fieldset>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button className={`primary ${styles.submit}`} disabled={pending} type="submit">
            {pending ? "正在处理…" : "重置密码 →"}
          </button>
          <p className={styles.help}>
            重置成功后，所有已登录的设备都会退出，需要用新密码重新登录。
          </p>
        </form>
      )}
      <p className={styles.switch}>
        想起密码了？ <Link href="/login">去登录</Link>
      </p>
    </section>
  );
}
