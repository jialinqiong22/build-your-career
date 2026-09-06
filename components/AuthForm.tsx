"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./auth.module.css";

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const register = mode === "register";
  const [kind, setKind] = useState<"email" | "phone">("email");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [retryUntil, setRetryUntil] = useState(0);
  const [seconds, setSeconds] = useState(0);
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || seconds > 0) return;
    setError("");
    if (register && !/^[\p{L}\p{N}_-]{2,30}$/u.test(username.trim())) {
      setError("用户名请使用 2–30 个文字、字母、数字、下划线或短横线。");
      return;
    }
    if (
      register &&
      ([...password].length < 12 ||
        new TextEncoder().encode(password).length > 72)
    ) {
      setError(
        "密码至少 12 个字符，且不超过 72 个 UTF-8 字节；中文字符会占用更多字节。",
      );
      return;
    }
    if (register && password !== confirm) {
      setError("两次输入的密码不一致，请重新确认。");
      return;
    }
    if (register && !turnstileToken) {
      setError("请先完成人机验证。");
      return;
    }
    const account = (
      register ? (kind === "email" ? email : phone) : identifier
    ).trim();
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...(register ? { username: username.trim() } : {}),
          identifier: account,
          password,
          ...(register ? { turnstileToken } : {}),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 429) {
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
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "暂时无法完成操作，请稍后重试。",
        );
      }
      if (!data?.user) throw new Error("未能确认登录状态，请重新登录。");
      window.location.assign("/");
    } catch (cause) {
      if (register) {
        setTurnstileToken("");
        turnstile.current?.reset();
      }
      setError(
        cause instanceof Error ? cause.message : "网络连接异常，请稍后重试。",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.intro} aria-labelledby="auth-title">
        <span className="eyebrow">YOUR NEXT CHAPTER / 观己账号</span>
        <h1 id="auth-title">
          {register ? (
            <>
              认识自己，
              <br />
              从此刻开始。
            </>
          ) : (
            <>
              欢迎回来，
              <br />
              继续认识自己。
            </>
          )}
        </h1>
        <p>
          {register
            ? "选择邮箱或手机号，创建属于你的账号。"
            : "使用注册时填写的邮箱或手机号与密码登录。"}
        </p>
        <div className={styles.boundary}>
          <span className="eyebrow">关于这个账号</span>
          <p>
            账号用于身份登录，不代表已购买 ¥199
            套餐，也不会自动将测评答案或报告保存到云端。
          </p>
          <p>
            当前邮箱和手机号尚未验证；暂不提供验证码登录或密码找回。请使用你自己的联系方式，并妥善保存密码。
          </p>
        </div>
      </section>
      <section
        className={styles.card}
        aria-label={register ? "创建账号表单" : "登录表单"}
      >
        <div className={styles.cardHeading}>
          <span className="eyebrow">
            {register ? "01 / CREATE ACCOUNT" : "02 / SIGN IN"}
          </span>
          <h2>{register ? "创建账号" : "登录账号"}</h2>
        </div>
        <form onSubmit={submit} aria-busy={pending}>
          <fieldset className={styles.fields} disabled={pending}>
            {register && (
              <label className={styles.field}>
                用户名
                <input
                  name="username"
                  autoComplete="nickname"
                  required
                  minLength={2}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-describedby="username-help"
                />
                <span id="username-help" className={styles.help}>
                  2–30 个文字、字母、数字、下划线或短横线；用户名须唯一。
                </span>
              </label>
            )}
            {register ? (
              <>
                <fieldset className={styles.method}>
                  <legend>注册方式（二选一）</legend>
                  <label>
                    <input
                      type="radio"
                      name="contact-kind"
                      value="email"
                      checked={kind === "email"}
                      onChange={() => setKind("email")}
                    />
                    邮箱
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="contact-kind"
                      value="phone"
                      checked={kind === "phone"}
                      onChange={() => setKind("phone")}
                    />
                    手机号
                  </label>
                </fieldset>
                {kind === "email" ? (
                  <label className={styles.field}>
                    邮箱
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
                  </label>
                ) : (
                  <label className={styles.field}>
                    手机号
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={20}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-describedby="phone-help"
                      placeholder="13800138000 或 +8613800138000"
                    />
                    <span id="phone-help" className={styles.help}>
                      中国大陆可直接填写 11 位手机号；其他地区请填写
                      +国家码及完整号码。
                    </span>
                  </label>
                )}
              </>
            ) : (
              <label className={styles.field}>
                邮箱或手机号
                <input
                  name="identifier"
                  autoComplete="username"
                  maxLength={254}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  aria-describedby="identifier-help"
                />
                <span id="identifier-help" className={styles.help}>
                  使用注册时的联系方式，不是用户名。大陆手机号可输入 11
                  位，其他地区请带 +国家码。
                </span>
              </label>
            )}
            <label className={styles.field}>
              密码
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={register ? "password-help" : undefined}
              />
              {register && (
                <span id="password-help" className={styles.help}>
                  至少 12 个字符，最多 72 个 UTF-8
                  字节。中文字符占用更多字节；首尾空格也属于密码。
                </span>
              )}
            </label>
            {register && (
              <label className={styles.field}>
                再次输入密码
                <input
                  name="confirm-password"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>
            )}
            <label className={styles.showPassword}>
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              显示密码
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
          {register &&
            (turnstileSiteKey ? (
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
                    action: "register",
                    language: "zh-cn",
                    responseField: false,
                    size: "flexible",
                    theme: "light",
                  }}
                />
              </div>
            ) : (
              <p className={styles.error} role="alert">
                注册验证尚未配置，请稍后再试。
              </p>
            ))}
          <button
            className={`primary ${styles.submit}`}
            disabled={
              pending ||
              seconds > 0 ||
              (register && (!turnstileSiteKey || !turnstileToken))
            }
            type="submit"
          >
            {pending ? "正在处理…" : register ? "注册并登录 →" : "登录 →"}
          </button>
          <p className={styles.help}>
            {register
              ? "注册成功后自动登录并返回首页。账号资料会存储在 Neon 数据库中，密码仅以 bcrypt 哈希形式存储。"
              : "登录成功后返回首页。答案的本机保存设置不会因登录而改变。"}
          </p>
        </form>
        <p className={styles.switch}>
          {register ? "已经有账号？" : "还没有账号？"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "去登录" : "创建账号"}
          </Link>
        </p>
      </section>
    </div>
  );
}
