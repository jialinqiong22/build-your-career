import "server-only";
import { isIP } from "node:net";
import { sql } from "drizzle-orm";
import { getDb, authConfigured } from "./db";
import { authLimits } from "./db/schema";
import { AuthError } from "./auth-validation";
import { privateDigest } from "./auth-crypto";

export const responseHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};

export const digest = (value: string) =>
  privateDigest(value, process.env.AUTH_SECRET || "");

export function errorResponse(error: unknown) {
  if (error instanceof AuthError)
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        headers: {
          ...responseHeaders,
          ...(error.retryAfter
            ? { "Retry-After": String(error.retryAfter) }
            : {}),
        },
      },
    );
  // Never log database errors, identifiers, passwords, connection strings or session tokens.
  console.error("Account operation unavailable");
  return Response.json(
    { error: "账号服务暂时不可用，请稍后重试。" },
    { status: 503, headers: responseHeaders },
  );
}

export function assertConfigured() {
  if (!authConfigured())
    throw new AuthError("账号服务尚未配置完成，请稍后再试。", 503);
}

// Only trust Vercel's overwritten platform header, never arbitrary X-Forwarded-For.
export function requestSource(request: Request) {
  if (process.env.VERCEL === "1") {
    const address = request.headers.get("x-vercel-forwarded-for")?.trim();
    if (address && isIP(address)) return address;
  }
  return "shared-untrusted-source";
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const db = getDb();
  const now = new Date();
  const expires = new Date(now.getTime() + windowSeconds * 1000);
  const [row] = await db
    .insert(authLimits)
    .values({ key: digest(`rate:${key}`), hits: 1, expiresAt: expires })
    .onConflictDoUpdate({
      target: authLimits.key,
      set: {
        hits: sql`CASE WHEN ${authLimits.expiresAt} <= ${now} THEN 1 ELSE ${authLimits.hits} + 1 END`,
        expiresAt: sql`CASE WHEN ${authLimits.expiresAt} <= ${now} THEN ${expires} ELSE ${authLimits.expiresAt} END`,
      },
    })
    .returning();
  if (row.hits > limit)
    throw new AuthError(
      "尝试次数过多，请稍后再试。",
      429,
      Math.max(1, Math.ceil((row.expiresAt.getTime() - now.getTime()) / 1000)),
    );
}
