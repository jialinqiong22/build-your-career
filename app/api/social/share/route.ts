import { ImageResponse } from "next/og";
import { createElement as h, type CSSProperties, type ReactNode } from "react";
import { sameOrigin } from "@/lib/request-origin";
import {
  buildShareInterpretation,
  parseShareScores,
  shareDimensions,
} from "@/lib/share-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const labels = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Emotional stability"];
function box(style: CSSProperties, ...children: ReactNode[]) {
  return h("div", { style: { display: "flex", ...style } }, ...children);
}
function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("请求来源无效。", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return error("需要JSON格式。", 415);
  // Read only a bounded body, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return error("缺少分数。", 400);
  let body = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); return error("请求过大。", 413); }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    const scores = parseShareScores(JSON.parse(body));
    if (!scores) return error("需要五个0–100整数分数；信息不足请传null。", 400);
    const interpretation = buildShareInterpretation(scores);
    const origin = request.headers.get("origin")!;
    return new ImageResponse(
      box({ width: "100%", height: "100%", flexDirection: "column", padding: 60, background: "#fafafa", color: "#242424", fontFamily: "sans-serif" },
        box({ fontSize: 18, letterSpacing: 3, color: "#526259" }, "GUANJI / BUILD YOUR CAREER"),
        box({ fontSize: 44, marginTop: 32, fontWeight: 700 }, "My Big Five snapshot"),
        box({ fontSize: 20, marginTop: 12, color: "#595959" }, "IPIP-50 · Self-exploration, not a diagnosis"),
        ...shareDimensions.map((key, i) => {
          const value = scores[key] === null ? null : key === "N" ? 100 - scores[key] : scores[key];
          return box({ flexDirection: "column", marginTop: 30 },
            box({ justifyContent: "space-between", fontSize: 23 }, h("span", null, labels[i]), h("span", null, value === null ? "Not enough data" : `${value} / 100`)),
            box({ height: 12, marginTop: 12, background: "#e3e8e5", borderRadius: 6 },
              box({ width: `${value ?? 0}%`, height: 12, background: "#254d43", borderRadius: 6 })),
          );
        }),
        box({ fontSize: 18, marginTop: 38, color: "#595959" }, "A starting point for reflection, never a fixed label."),
        box({ fontSize: 16, marginTop: 12, color: "#595959" }, "Self-reported scores, not verified. Not population percentiles."),
        box({ fontSize: 17, marginTop: 30, paddingTop: 22, borderTop: "1px solid #d9d9d9", overflowWrap: "anywhere" }, origin),
        interpretation
          ? box({ flexDirection: "column", marginTop: 30, padding: "22px 24px", background: "#eef3f0", borderLeft: "5px solid #254d43" },
              box({ fontSize: 15, letterSpacing: 2.2, color: "#526259", fontWeight: 700 }, "A SHORT READ"),
              box({ fontSize: 17, lineHeight: 1.42, marginTop: 14 },
                `Strengths — ${interpretation.strengths}`),
              box({ fontSize: 17, lineHeight: 1.42, marginTop: 10 },
                `Watch-outs — ${interpretation.watchOuts}.`),
              box({ fontSize: 17, lineHeight: 1.42, marginTop: 10 },
                `Try next — ${interpretation.nextStep}.`),
            )
          : box({ fontSize: 17, marginTop: 30, padding: "20px 24px", background: "#eef3f0", color: "#526259" },
              "Complete all five dimensions to receive a short interpretation."),
      ),
      { width: 800, height: 1240, headers: { "Cache-Control": "private, no-store", "Content-Disposition": 'inline; filename="guanji-ipip50.png"' } },
    );
  } catch { return error("分享卡片生成失败，请重试。", 400); }
  finally { reader.releaseLock(); }
}
