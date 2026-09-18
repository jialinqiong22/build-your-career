import { premiumAccessFromRequest, planForGrant } from "@/lib/premium-access";
import { getCurrentUser } from "@/lib/auth";
import { questions120 } from "@/lib/bigfive/data120";
import { questions50 } from "@/lib/bigfive/data50";
import { enneagramQuestions } from "@/lib/instruments";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const user = await getCurrentUser(request).catch(() => null);
  const grant = premiumAccessFromRequest(request, user?.id);
  if (!grant)
    return Response.json(
      { error: "请先兑换有效服务码。" },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  const plan = planForGrant(grant);
  return Response.json(
    { bigFive: plan === "guided" ? questions120 : questions50, enneagram: enneagramQuestions, plan, canPrint: plan === "guided" },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
