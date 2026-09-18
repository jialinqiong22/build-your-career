import Link from "next/link";
import PasswordResetForm from "@/components/PasswordResetForm";
export const metadata = { title: "重置密码 · 观己" };
export default function ForgotPasswordPage() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <Link href="/">返回首页 ↗</Link>
      </header>
      <main>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "45px 0 50px" }}>
          <PasswordResetForm />
        </div>
      </main>
    </>
  );
}
