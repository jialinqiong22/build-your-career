"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function PremiumCheckout({
  contact,
}: {
  contact: string | null;
}) {
  const [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [status, setStatus] = useState<{
      configured: boolean;
      active: boolean;
      expiresAt?: string | null;
    } | null>(null);
  useEffect(() => {
    fetch("/api/premium/access", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setMessage("暂时无法查询兑换服务，请稍后再试。"));
  }, []);
  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/premium/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage(data.error || "兑换失败，请核对服务码。");
        return;
      }
      setCode("");
      location.href = "/assessment";
    } catch {
      setMessage("网络异常，未能完成兑换，请重试。");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/premium/access", { method: "DELETE" });
      if (r.ok) {
        setStatus((s) => (s ? { ...s, active: false } : s));
        setMessage("已退出这台设备的套餐访问，测评记录未删除。");
      } else setMessage("退出失败，请重试。");
    } catch {
      setMessage("网络异常，请重试。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="report-card">
        <span className="eyebrow">完整定位服务</span>
        <h1 className="page-title">全套测评 · PDF · 沟通</h1>
        <p className="price">
          ¥199 <small>一次套餐服务</small>
        </p>
        <p>
          原创职业价值观40题、霍兰德兴趣探索、大五120题与30项细分特质、潜力证据与成长条件、完整PDF报告及后续沟通。九型原创动机反思为可选补充。沟通方式、时间和安排请购买前确认。
        </p>
        <div className="receipt-steps">
          <p>
            <b>01 联系确认</b>　确认服务内容、沟通安排与微信/支付宝收款方式。
          </p>
          <p>
            <b>02 人工核实</b>
            　服务方确认到账后发放兑换码，不以页面点击或付款截图自动判定到账。
          </p>
          <p>
            <b>03 兑换与测评</b>
            　输入兑换码，完成全套测评，保存PDF并联系约定沟通。
          </p>
        </div>
        {contact ? (
          <div className="info-box">
            <b>联系渠道</b>
            <p className="contact-detail">{contact}</p>
          </div>
        ) : (
          <div className="info-box">
            联系渠道尚未配置，目前暂不收款。请通过你与服务方已有的沟通渠道确认。
          </div>
        )}
        {status && !status.configured && (
          <p className="notice">
            兑换服务尚未启用。请先使用50题免费版，服务开放前不要付款。
          </p>
        )}
      </div>
      {status?.active ? (
        <section className="info-box">
          <h2>套餐访问已激活</h2>
          <Link className="primary" href="/assessment">
            进入 / 继续完整测评 ↗
          </Link>
          <button className="text-button" disabled={busy} onClick={logout}>
            退出当前设备
          </button>
          <p className="small">
            请勿分享兑换码。更换设备或会话到期后可使用有效兑换码重新验证。
          </p>
        </section>
      ) : (
        <form className="redeem-form" onSubmit={redeem}>
          <label className="field-label">
            已有兑换码
            <textarea
              className="redeem-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={1024}
              autoComplete="off"
              spellCheck={false}
              placeholder="粘贴人工确认收款后获得的完整兑换码"
              required
            />
          </label>
          <button
            className="primary"
            disabled={busy || !code.trim() || !status?.configured}
          >
            {busy ? "正在验证…" : "兑换199元服务套餐"}
          </button>
          <p className="small">
            验证会将兑换码发给本站服务器，并设置仅用于套餐访问的Cookie。兑换码是访问凭证，请妥善保管。
          </p>
        </form>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <a className="secondary" href="/big-five">
        先做50题免费大五
      </a>
      <p className="small">
        120题与50题不是简单追加关系，进阶版需独立完整作答。付费购买的是整套服务，而非公开题目的独占使用权。
      </p>
    </>
  );
}
