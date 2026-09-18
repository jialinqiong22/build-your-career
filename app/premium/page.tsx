import PremiumCheckout from "@/components/PremiumCheckout";
import ModuleCatalog from "@/components/ModuleCatalog";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Premium({searchParams}: {searchParams: Promise<{plan?: string}>}) {
  const {plan} = await searchParams;
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          观己<span>BUILD YOUR CAREER</span>
        </Link>
        <span className="edition">完整定位套餐</span>
      </header>
      <main className="standalone">
        <PremiumCheckout contact={process.env.PREMIUM_CONTACT || null} selectedPlan={plan === "standard" ? "standard" : "guided"} />
        <ModuleCatalog />
      </main>
    </>
  );
}
