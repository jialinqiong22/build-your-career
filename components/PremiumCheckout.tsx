"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import WeChatContact from "@/components/WeChatContact";
export default function PremiumCheckout({
  contact,
  selectedPlan,
}: {
  contact: string | null;
  selectedPlan: "standard" | "guided";
}) {
  const { requireAuth, user } = useAuth();
  const [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [status, setStatus] = useState<{
      configured: boolean;
      active: boolean;
      plan: "free" | "standard" | "guided";
      expiresAt?: string | null;
    } | null>(null);
  useEffect(() => {
    fetch("/api/premium/access", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setMessage("暂时无法查询兑换服务，请稍后再试。"));
  }, [user]);
  async function redeem() {
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
        <h1 className="page-title">选择适合你的探索深度</h1>
        <p className="notice">当前了解：{selectedPlan === "standard" ? "¥9.9 完整四维，自己看" : "¥99 完整四维＋一次沟通"}。实际开通权益以兑换码为准。</p>
        <p><b>免费</b> · 50题大五，约7分钟，无需注册即可查看结果。</p>
        <p><b>¥9.9 完整四维</b> · 大五50题、职业价值观、霍兰德兴趣、潜力证据与成长条件，在线结构化定位小结。九型为可选补充。</p>
        <p><b>¥99 深入探索</b> · 包含完整四维，大五升级为120题与30项细分特质，完整PDF报告与一次1对1沟通。沟通方式和时间请购买前确认。</p>
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
            　登录后输入属于你的兑换码，开始对应套餐测评。99元套餐可保存PDF并预约沟通。
          </p>
        </div>
        <WeChatContact plan={selectedPlan} />
        {contact ? (
          <div className="info-box">
            <b>联系渠道</b>
            <p className="contact-detail">{contact}</p>
          </div>
        ) : (
          <div className="info-box">
            <b>购买前请先联系</b>
            <p>请使用上方微信二维码确认服务内容与开通安排；未确认前请不要直接转账。</p>
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
          <h2>{status.plan === "guided" ? "99元深入探索" : "9.9元完整四维"}已激活</h2>
          <Link className="primary" href="/assessment">
            进入 / 继续完整测评 ↗
          </Link>
          <button className="text-button" disabled={busy} onClick={logout}>
            退出当前设备
          </button>
          <p className="small">
            兑换码绑定购买时确认的账号。更换设备或会话到期后，请登录同一账号重新兑换。
          </p>
        </section>
      ) : (
        <form className="redeem-form" onSubmit={(e) => { e.preventDefault(); requireAuth(redeem); }}>
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
            {busy ? "正在验证…" : "登录并兑换套餐"}
          </button>
          <p className="small">
            验证会将兑换码发给本站服务器，并设置套餐访问Cookie；服务器每次访问都会核对当前账号。请妥善保管兑换码。
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
