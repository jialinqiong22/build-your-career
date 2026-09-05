import { premiumAccessFromRequest } from "@/lib/premium-access";
import { sameOrigin } from "@/lib/request-origin";
import { questions120 } from "@/lib/bigfive/data120";
import { validProfile, finished, report } from "@/lib/positioning";
import { enneagramQuestions } from "@/lib/instruments";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "请求来源无效。" }, { status: 403, headers });
  if (!premiumAccessFromRequest(request))
    return Response.json(
      { error: "兑换状态已失效，请重新兑换。" },
      { status: 403, headers },
    );
  try {
    const reader = request.body?.getReader();
    if (!reader) throw Error("empty");
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 100000) {
        await reader.cancel();
        return Response.json(
          { error: "报告数据过大。" },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    const p = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const banks = { bigFive: questions120, enneagram: enneagramQuestions };
    if (!validProfile(p, banks) || !finished(p, banks))
      return Response.json(
        { error: "题库版本或回答不完整，请检查。" },
        { status: 400, headers },
      );
    return Response.json({ report: report(p, banks) }, { headers });
  } catch {
    return Response.json(
      { error: "报告数据格式无效。" },
      { status: 400, headers },
    );
  }
}
