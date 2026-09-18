import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import CrispChat from "@/components/CrispChat";
import "./globals.css";

export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "观己 · 个人定位仪 | Build Your Career",
  description:
    "从兴趣、工作方式、价值观和真实经历理解自己。面向大学生与应届生的个人定位探索工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <CrispChat />
      </body>
    </html>
  );
}
