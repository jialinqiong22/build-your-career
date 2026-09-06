import * as React from "react";
import {
  Body,
  Button,
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

type WelcomeEmailProps = {
  assessmentUrl?: string | null;
  supportEmail?: string | null;
  userName: string;
};

export function WelcomeEmail({
  assessmentUrl,
  supportEmail,
  userName,
}: WelcomeEmailProps) {
  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>你不需要现在就知道答案，我们先一起整理线索。</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>BUILD YOUR CAREER</Text>
            <Heading style={heading}>Hi {userName}，欢迎来到 Build Your Career</Heading>

            <Text style={paragraph}>你好，我是小 Build。</Text>
            <Text style={paragraph}>
              如果你现在还不知道自己适合什么，不必着急。对于大多数还在读书或刚刚毕业的人来说，职业方向很少是“想出来的”，更多是在认识自己、尝试任务和积累证据的过程中逐渐变清楚的。
            </Text>

            <Text style={subheading}>
              接下来，我们会从四个角度帮助你完成个人定位：
            </Text>
            <Text style={listItem}>• 你容易被什么吸引——职业兴趣</Text>
            <Text style={listItem}>• 你习惯如何思考和行动——人格特质</Text>
            <Text style={listItem}>• 你愿意为什么长期投入——职业价值观</Text>
            <Text style={listItem}>
              • 你已经表现出哪些潜力——证据与成长条件
            </Text>

            <Text style={paragraph}>
              这里不会用一个标签定义你，也不会武断地告诉你“唯一适合的职业”。
            </Text>
            <Text style={paragraph}>
              我们更希望帮助你缩小选择范围，识别值得进一步验证的方向，并看清下一步可以做什么。
            </Text>

            {assessmentUrl ? (
              <Section style={buttonSection}>
                <Button href={assessmentUrl} style={button}>
                  开始认识自己
                </Button>
              </Section>
            ) : null}

            <Hr style={rule} />
            <Text style={closing}>
              以后在职业探索的路上，我会继续陪你整理线索。
            </Text>
            <Text style={closing}>
              不替你决定未来，但会陪你把选择看清楚。
            </Text>
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

WelcomeEmail.PreviewProps = {
  assessmentUrl: "https://example.com/assessment",
  supportEmail: "feedback@example.com",
  userName: "同学",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;

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

const subheading = {
  color: "#3d2a00",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1.85",
  margin: "26px 0 12px",
};

const listItem = {
  color: "#2f281e",
  fontSize: "15px",
  lineHeight: "1.75",
  margin: "7px 0",
};

const buttonSection = {
  margin: "32px 0 30px",
};

const button = {
  backgroundColor: "#002FA7",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "13px 22px",
  textDecoration: "none",
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
