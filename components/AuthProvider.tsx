"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AuthForm from "./AuthForm";
import styles from "./auth.module.css";

type User = { id: number; username: string };
type Action = () => void | Promise<void>;
type Context = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  requireAuth: (action: Action) => void;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<Context | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider required");
  return context;
}
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const action = useRef<Action | null>(null);
  const checking = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) throw new Error("账号服务暂时不可用。");
      const data = await response.json();
      setUser(data.user || null);
      setConfigured(data.configured === true);
    } catch {
      setUser(null);
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const requireAuth = useCallback((next: Action) => {
    if (checking.current || action.current) return;
    checking.current = true;
    setError("");
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setUser(data.user || null);
        setConfigured(data.configured === true);
        if (data.user) await next();
        else {
          action.current = next;
          setOpen(true);
        }
      } catch {
        setError("账号或操作暂时不可用，请保留当前内容并重试。");
      } finally {
        checking.current = false;
        setLoading(false);
      }
    })();
  }, []);
  function close() {
    action.current = null;
    setOpen(false);
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, configured, requireAuth, refresh }}
    >
      {children}
      <dialog
        ref={dialog}
        className={styles.modal}
        aria-labelledby="auth-modal-title"
        onCancel={close}
        onClose={() => setOpen(false)}
      >
        <button
          className={styles.modalClose}
          type="button"
          onClick={close}
          aria-label="关闭登录"
        >
          关闭 ×
        </button>
        <h2 id="auth-modal-title">登录后继续</h2>
        <p>当前填写内容会保留，登录成功后自动接着完成刚才的操作。</p>
        {loading ? (
          <p role="status">正在确认账号服务…</p>
        ) : !configured ? (
          <p role="status">
            账号服务尚未配置完成，暂时无法登录、兑换或云端保存。你仍可继续免费大五测评。
          </p>
        ) : (
          <details open>
            <summary>邮箱与密码</summary>
            {open && (
              <AuthForm
                compact
                mode={mode}
                onModeChange={setMode}
                onSuccess={(signedIn) => {
                  setUser(signedIn);
                  const next = action.current;
                  action.current = null;
                  setOpen(false);
                  if (next)
                    void Promise.resolve()
                      .then(next)
                      .catch(() =>
                        setError("已登录，但刚才的操作未完成，请再次尝试。"),
                      );
                }}
              />
            )}
          </details>
        )}
      </dialog>
      {error && (
        <p role="alert" className={styles.navError}>
          {error}
        </p>
      )}
    </AuthContext.Provider>
  );
}
