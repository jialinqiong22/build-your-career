import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type VerificationCodeEmailProps = {
  code: string;
  purpose: "register" | "password_reset";
  supportEmail?: string | null;
};

const copy = {
  register: {
    preview: "你的注册验证码，10 分钟内有效。",
    heading: "你的注册验证码",
    intro: "你正在注册 Build Your Career 账号。请在 10 分钟内输入下面的验证码完成注册：",
    closing: "如果你没有尝试注册，可以忽略这封邮件，不会产生任何影响。",
  },
  password_reset: {
    preview: "你的密码重置验证码，10 分钟内有效。",
    heading: "重置密码验证码",
    intro: "你正在重置 Build Your Career 账号的密码。请在 10 分钟内输入下面的验证码继续重置：",
    closing: "如果你没有尝试重置密码，可以忽略这封邮件，账号不会发生任何变化。",
  },
};

export function VerificationCodeEmail({
  code,
  purpose,
  supportEmail,
}: VerificationCodeEmailProps) {
  const text = copy[purpose];
  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>BUILD YOUR CAREER</Text>
            <Heading style={heading}>{text.heading}</Heading>
            <Text style={paragraph}>{text.intro}</Text>
            <Section style={codeSection}>
              <Text style={codeBox}>{code}</Text>
            </Section>
            <Text style={paragraph}>
              验证码 10
              分钟内有效。为了你的账号安全，请不要把验证码告诉任何人，包括自称客服的人。
            </Text>
            <Hr style={rule} />
            <Text style={closing}>{text.closing}</Text>
            <Text style={signature}>
              小 Build
              <br />
              Build Your Career
            </Text>
            {supportEmail ? (
              <Text style={support}>
                有问题或建议？联系我们：
                <br />
                <Link href={`mailto:${supportEmail}`} style={supportLink}>
                  {supportEmail}
                </Link>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

VerificationCodeEmail.PreviewProps = {
  code: "123456",
  purpose: "register",
  supportEmail: "feedback@example.com",
} satisfies VerificationCodeEmailProps;

export default VerificationCodeEmail;

const body = {
  backgroundColor: "#f5f7ff",
  color: "#2f281e",
  fontFamily:
    "'Goldman Sans', Roboto, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  margin: "0",
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "44px 24px",
};

const card = {
  backgroundColor: "#ffffff",
  borderTop: "4px solid #002FA7",
  boxShadow: "0 12px 35px rgba(0, 47, 167, 0.08)",
  padding: "38px 34px",
};

const brand = {
  color: "#A66B00",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1.4px",
  margin: "0 0 10px",
};

const heading = {
  color: "#563900",
  fontFamily:
    "Baskerville, 'Times New Roman', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontSize: "28px",
  fontWeight: "500",
  lineHeight: "1.45",
  margin: "0 0 26px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.85",
  margin: "14px 0",
};

const codeSection = {
  margin: "26px 0",
};

const codeBox = {
  backgroundColor: "#eef2ff",
  border: "1px solid #b9c4e2",
  borderRadius: "4px",
  color: "#002FA7",
  fontSize: "34px",
  fontWeight: "700",
  letterSpacing: "10px",
  margin: "0",
  padding: "16px 0",
  textAlign: "center" as const,
};

const rule = {
  borderColor: "#d8def0",
  margin: "34px 0 22px",
};

const closing = {
  color: "#706656",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "7px 0",
};

const signature = {
  color: "#3d2a00",
  fontSize: "14px",
  fontWeight: "600",
  lineHeight: "1.7",
  margin: "18px 0 0",
};

const support = {
  color: "#706656",
  fontSize: "12px",
  lineHeight: "1.7",
  margin: "24px 0 0",
};

const supportLink = {
  color: "#002FA7",
  textDecoration: "underline",
};
