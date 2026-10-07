import Image from "next/image";

export default function WeChatContact({
  plan,
}: {
  plan: "standard" | "guided";
}) {
  const guided = plan === "guided";

  return (
    <aside
      className="wechat-contact"
      aria-label={guided ? "发送结果并预约沟通" : "咨询完整测评"}
    >
      <div className="wechat-qr-frame">
        <Image
          src="/wechat-career-mentor-qr.png"
          alt="添加微信联系职业导师的二维码"
          width={781}
          height={915}
          sizes="(max-width: 760px) 168px, 156px"
          unoptimized
        />
      </div>
      <div className="wechat-contact-copy">
        <span className="eyebrow">WECHAT / 微信联系</span>
        <h4>
          {guided
            ? "添加微信，发送结果并预约沟通"
            : "添加微信，了解完整测评与开通方式"}
        </h4>
        <p>
          {guided
            ? "扫码备注「观己」，发送你愿意分享的四个模块结果，说明想咨询的求职定位问题，再确认沟通时间和服务安排。"
            : "扫码添加职业导师，备注「观己」，确认测评内容、使用方式与开通安排。"}
        </p>
      </div>
    </aside>
  );
}
