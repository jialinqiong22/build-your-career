import Link from "next/link";
import AuthForm from "@/components/AuthForm";
export const metadata = { title: "注册 · 观己" };
export default function RegisterPage() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <Link href="/">返回首页 ↗</Link>
      </header>
      <main>
        <AuthForm mode="register" />
      </main>
    </>
  );
}
