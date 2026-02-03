import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build Your Career - AI 职业核心定位系统",
  description: "AI 职业核心定位系统 - 通过 MBTI x 霍兰德 x 九型人格的三维交叉演算，提供精准的职业定位与避坑建议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
