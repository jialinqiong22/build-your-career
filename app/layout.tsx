import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import CrispChat from "@/components/CrispChat";
import "./globals.css";

export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "观己 · 个人定位仪 | Anchor Point Career",
  description:
    "完成大五人格、霍兰德职业兴趣、职业价值观与九型人格，保存结果并预约求职定位咨询。",
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
