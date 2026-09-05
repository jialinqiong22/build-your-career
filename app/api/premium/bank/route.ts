import { premiumAccessFromRequest } from "@/lib/premium-access";
import { questions120 } from "@/lib/bigfive/data120";
import { enneagramQuestions } from "@/lib/instruments";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!premiumAccessFromRequest(request))
    return Response.json(
      { error: "请先兑换有效服务码。" },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  return Response.json(
    { bigFive: questions120, enneagram: enneagramQuestions },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
