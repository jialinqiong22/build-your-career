import "server-only";

import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { VerificationCodeEmail } from "@/emails/VerificationCodeEmail";

let resend: Resend | undefined;

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !fromEmail) return null;

  resend ??= new Resend(apiKey);
  return { client: resend, fromEmail };
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  siteOrigin?: string,
): Promise<"sent" | "skipped"> {
  const config = getEmailConfig();
  if (!config) return "skipped";

  const testRecipient = process.env.RESEND_TEST_TO_EMAIL?.trim();
  const supportEmail = process.env.SUPPORT_EMAIL?.trim();
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = (configuredOrigin || siteOrigin)?.replace(/\/+$/, "");
  const assessmentUrl = origin ? `${origin}/assessment` : null;

  const { error } = await config.client.emails.send({
    from: `小 Build｜Build Your Career <${config.fromEmail}>`,
    // The override is useful while Resend's onboarding sender is limited to the
    // account owner's verified email. Remove it after verifying a real domain.
    to: testRecipient || userEmail,
    subject: "欢迎来到 Build Your Career｜先从看清自己开始",
    ...(supportEmail ? { replyTo: supportEmail } : {}),
    react: WelcomeEmail({ assessmentUrl, supportEmail, userName }),
    text: `Hi ${userName}，

你好，我是小 Build。

欢迎来到 Build Your Career。

如果你现在还不知道自己适合什么，不必着急。对于大多数还在读书或刚刚毕业的人来说，职业方向很少是“想出来的”，更多是在认识自己、尝试任务和积累证据的过程中逐渐变清楚的。

接下来，我们会从四个角度帮助你完成个人定位：
你容易被什么吸引——职业兴趣
你习惯如何思考和行动——人格特质
你愿意为什么长期投入——职业价值观
你已经表现出哪些潜力——证据与成长条件

这里不会用一个标签定义你，也不会武断地告诉你“唯一适合的职业”。我们更希望帮助你缩小选择范围，识别值得进一步验证的方向，并看清下一步可以做什么。

${assessmentUrl ? `开始认识自己：${assessmentUrl}\n\n` : ""}以后在职业探索的路上，我会继续陪你整理线索。

不替你决定未来，但会陪你把选择看清楚。

小 Build
Build Your Career`,
  });

  if (error) throw new Error("Resend rejected the welcome email request");
  return "sent";
}

export type VerificationPurpose = "register" | "password_reset";

const VERIFICATION_COPY = {
  register: {
    subject: "你的注册验证码｜Build Your Career",
    intro: "你正在注册 Build Your Career 账号。",
  },
  password_reset: {
    subject: "重置密码验证码｜Build Your Career",
    intro: "你正在重置 Build Your Career 账号的密码。",
  },
} as const;

export async function sendVerificationCodeEmail(
  userEmail: string,
  code: string,
  purpose: VerificationPurpose,
): Promise<"sent" | "skipped"> {
  const config = getEmailConfig();
  if (!config) return "skipped";

  const testRecipient = process.env.RESEND_TEST_TO_EMAIL?.trim();
  const supportEmail = process.env.SUPPORT_EMAIL?.trim();
  const copy = VERIFICATION_COPY[purpose];

  const { error } = await config.client.emails.send({
    from: `小 Build｜Build Your Career <${config.fromEmail}>`,
    // The override is useful while Resend's onboarding sender is limited to the
    // account owner's verified email. Remove it after verifying a real domain.
    to: testRecipient || userEmail,
    subject: copy.subject,
    ...(supportEmail ? { replyTo: supportEmail } : {}),
    react: VerificationCodeEmail({ code, purpose, supportEmail }),
    text: `${copy.intro}

验证码：${code}

验证码 10 分钟内有效。请不要把验证码告诉任何人。如果这不是你的操作，可以忽略这封邮件。

小 Build
Build Your Career`,
  });

  if (error) throw new Error("Resend rejected the verification email request");
  return "sent";
}
