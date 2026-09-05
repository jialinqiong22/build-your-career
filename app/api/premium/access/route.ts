import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/request-origin";
import {
  createPremiumSession,
  premiumAccessFromRequest,
  premiumConfigured,
  PREMIUM_COOKIE,
} from "../../../../lib/premium-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, private" };
function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers });
}
export async function GET(request: Request) {
  const grant = premiumAccessFromRequest(request);
  return reply({
    configured: premiumConfigured(),
    active: Boolean(grant),
    expiresAt: grant ? new Date(grant.exp * 1000).toISOString() : null,
  });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "请求来源无效。" }, 403);
  if (!premiumConfigured())
    return reply({ error: "兑换服务尚未配置，请联系服务方。" }, 503);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return reply({ error: "请使用 JSON 请求。" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 2048)
    return reply({ error: "请求过大。" }, 413);
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "请输入兑换码。" }, 400);
  let raw = "";
  let length = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2048) {
        await reader.cancel();
        return reply({ error: "请求过大。" }, 413);
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const data = JSON.parse(raw);
    if (!data || typeof data.code !== "string" || data.code.length > 1024)
      return reply({ error: "请输入有效兑换码。" }, 400);
    const session = createPremiumSession(data.code.trim());
    if (!session)
      return reply(
        { error: "兑换码无效、已过期或已撤销，请联系服务方。" },
        401,
      );
    const response = reply({
      configured: true,
      active: true,
      expiresAt: new Date(session.expiresAt * 1000).toISOString(),
    });
    response.cookies.set(PREMIUM_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
      expires: new Date(session.expiresAt * 1000),
    });
    return response;
  } catch {
    return reply({ error: "请求格式无效。" }, 400);
  } finally {
    reader.releaseLock();
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "请求来源无效。" }, 403);
  const response = reply({ active: false });
  response.cookies.set(PREMIUM_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
