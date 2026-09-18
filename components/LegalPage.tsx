import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-page">
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <Link href="/">返回首页 ↗</Link>
      </header>
      <main className="legal-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="small">生效日期：2026年9月18日</p>
        {children}
      </main>
      <footer className="legal-footer">
        <span>观己 / BUILD YOUR CAREER</span>
        <span><Link href="/privacy">隐私政策</Link> · <Link href="/terms">用户协议</Link></span>
      </footer>
    </div>
  );
}
