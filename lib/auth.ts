import "server-only";
import { isIP } from "node:net";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb, authConfigured } from "./db";
import { users, sessions, authLimits } from "./db/schema";
import {
  AuthError,
  normalizeIdentifier,
  normalizeUsername,
  validatePassword,
  readAuthBody,
} from "./auth-validation";
import {
  hashPassword,
  verifyPassword,
  privateDigest,
  newSessionToken,
  requestToken,
  sessionCookie,
  SESSION_SECONDS,
} from "./auth-crypto";
import { sameOrigin } from "./request-origin";
import { verifyTurnstile } from "./turnstile";

const responseHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
const digest = (value: string) =>
  privateDigest(value, process.env.AUTH_SECRET || "");
// A cached real bcrypt hash equalizes the missing-account path; no account uses this password.
let dummyHash: Promise<string> | undefined;
function errorResponse(error: unknown) {
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

function assertConfigured() {
  if (!authConfigured())
    throw new AuthError("账号服务尚未配置完成，请稍后再试。", 503);
}

// Only trust Vercel's overwritten platform header, never arbitrary X-Forwarded-For.
function requestSource(request: Request) {
  if (process.env.VERCEL === "1") {
    const address = request.headers.get("x-vercel-forwarded-for")?.trim();
    if (address && isIP(address)) return address;
  }
  return "shared-untrusted-source";
}

async function rateLimit(key: string, limit: number, windowSeconds: number) {
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

function uniqueViolation(error: unknown): boolean {
  let current = error;
  for (
    let depth = 0;
    depth < 4 && current && typeof current === "object";
    depth++
  ) {
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export async function credentials(
  request: Request,
  mode: "register" | "login",
) {
  try {
    if (!sameOrigin(request)) throw new AuthError("请求来源无效。", 403);
    assertConfigured();
    await rateLimit(
      `${mode}:source:${requestSource(request)}`,
      mode === "register" ? 20 : 60,
      900,
    );
    const body = await readAuthBody(request);
    const identifier = normalizeIdentifier(body.identifier);
    const password = validatePassword(body.password);
    const username =
      mode === "register" ? normalizeUsername(body.username) : null;
    await rateLimit(
      `${mode}:identity:${identifier.kind}:${identifier.value}`,
      mode === "register" ? 5 : 10,
      900,
    );
    if (mode === "register") {
      const verification = await verifyTurnstile({
        token: body.turnstileToken,
        secret: process.env.TURNSTILE_SECRET_KEY,
        expectedHostname: new URL(request.url).hostname,
        expectedAction: "register",
      });
      if (!verification.ok) {
        if (verification.reason === "misconfigured")
          throw new AuthError("注册验证尚未配置，请稍后再试。", 503);
        if (verification.reason === "unavailable")
          throw new AuthError("人机验证服务暂时不可用，请稍后重试。", 503);
        throw new AuthError("人机验证无效或已过期，请重新验证。", 403);
      }
    }
    const db = getDb();
    const token = newSessionToken();
    const oldToken = requestToken(request);
    const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
    let user: { id: number; username: string };
    if (mode === "register") {
      const passwordHash = await hashPassword(password);
      try {
        user = await db.transaction(async (tx) => {
          const [created] = await tx
            .insert(users)
            .values({
              username: username!,
              password: passwordHash,
              email: identifier.kind === "email" ? identifier.value : null,
              phone: identifier.kind === "phone" ? identifier.value : null,
            })
            .returning({ id: users.id, username: users.username });
          await tx
            .insert(sessions)
            .values({
              tokenHash: digest(`session:${token}`),
              userId: created.id,
              expiresAt,
            });
          if (oldToken)
            await tx
              .delete(sessions)
              .where(eq(sessions.tokenHash, digest(`session:${oldToken}`)));
          return created;
        });
      } catch (error) {
        if (uniqueViolation(error))
          throw new AuthError(
            "该用户名或联系方式不可用于注册，请更换或尝试登录。",
            409,
          );
        throw error;
      }
    } else {
      const [found] = await db
        .select({
          id: users.id,
          username: users.username,
          password: users.password,
        })
        .from(users)
        .where(
          identifier.kind === "email"
            ? eq(users.email, identifier.value)
            : eq(users.phone, identifier.value),
        )
        .limit(1);
      dummyHash ??= hashPassword(newSessionToken());
      const valid = await verifyPassword(
        password,
        found?.password || (await dummyHash),
      );
      if (!found || !valid)
        throw new AuthError("手机号/邮箱或密码不正确。", 401);
      user = { id: found.id, username: found.username };
      await db.transaction(async (tx) => {
        await tx
          .insert(sessions)
          .values({
            tokenHash: digest(`session:${token}`),
            userId: user.id,
            expiresAt,
          });
        if (oldToken)
          await tx
            .delete(sessions)
            .where(eq(sessions.tokenHash, digest(`session:${oldToken}`)));
        await tx
          .delete(sessions)
          .where(
            and(
              eq(sessions.userId, user.id),
              lt(sessions.expiresAt, new Date()),
            ),
          );
      });
    }
    return Response.json(
      { user },
      {
        status: mode === "register" ? 201 : 200,
        headers: { ...responseHeaders, "Set-Cookie": sessionCookie(token) },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function currentSession(request: Request) {
  try {
    if (!authConfigured())
      return Response.json(
        { user: null, configured: false },
        { headers: responseHeaders },
      );
    const token = requestToken(request);
    if (!token)
      return Response.json(
        { user: null, configured: true },
        { headers: responseHeaders },
      );
    const [user] = await getDb()
      .select({ id: users.id, username: users.username })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, digest(`session:${token}`)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return Response.json(
      { user: user || null, configured: true },
      {
        headers: {
          ...responseHeaders,
          ...(!user ? { "Set-Cookie": sessionCookie("", true) } : {}),
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function logout(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("请求来源无效。", 403);
    const token = requestToken(request);
    if (token) {
      assertConfigured();
      await getDb()
        .delete(sessions)
        .where(eq(sessions.tokenHash, digest(`session:${token}`)));
    }
    return Response.json(
      { user: null },
      {
        headers: { ...responseHeaders, "Set-Cookie": sessionCookie("", true) },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
