import Link from "next/link";
import AuthForm from "@/components/AuthForm";
export const metadata = { title: "登录 · 观己" };
export default function LoginPage() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <Link href="/">返回首页 ↗</Link>
      </header>
      <main>
        <AuthForm mode="login" />
      </main>
    </>
  );
}
