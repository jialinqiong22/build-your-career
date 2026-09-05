"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./auth.module.css";

export default function AuthNav() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("暂时无法确认登录状态");
        const data = await response.json();
        if (!controller.signal.aborted) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("暂时无法确认登录状态");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function logout() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("退出失败，请稍后重试。");
      window.location.assign("/");
    } catch {
      setError("退出失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <nav className={styles.nav} aria-label="用户账号">
      {loading ? (
        <span className={styles.help}>正在确认账号…</span>
      ) : user ? (
        <>
          <span className={styles.username} title={user.username}>
            你好，{user.username}
          </span>
          <button type="button" onClick={logout} disabled={pending}>
            {pending ? "正在退出…" : "退出登录"}
          </button>
        </>
      ) : (
        <>
          <Link href="/login">登录</Link>
          <Link className={styles.registerLink} href="/register">
            注册
          </Link>
        </>
      )}
      {error && (
        <span className={styles.navError} role="alert">
          {error}
        </span>
      )}
    </nav>
  );
}
