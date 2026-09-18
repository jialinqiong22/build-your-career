import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, authConfigured } from "./db";
import { users, sessions } from "./db/schema";
import {
  AuthError,
  normalizeEmail,
  normalizeUsername,
  requirePolicyAcceptance,
  validatePassword,
  readAuthBody,
} from "./auth-validation";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  requestToken,
  sessionCookie,
  SESSION_SECONDS,
} from "./auth-crypto";
import { sameOrigin } from "./request-origin";
import { sendWelcomeEmail } from "./email";
import {
  checkVerificationCode,
  consumeVerificationCode,
} from "./auth-email";
import { normalizeVerificationCode } from "./auth-email-crypto";
import {
  assertConfigured,
  digest,
  errorResponse,
  rateLimit,
  requestSource,
  responseHeaders,
} from "./auth-helpers";

// A cached real bcrypt hash equalizes the missing-account path; no account uses this password.
let dummyHash: Promise<string> | undefined;

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
    const email = normalizeEmail(body.identifier);
    const password = validatePassword(body.password);
    const username =
      mode === "register" ? normalizeUsername(body.username) : null;
    await rateLimit(
      `${mode}:identity:email:${email}`,
      mode === "register" ? 5 : 10,
      900,
    );
    let emailCode: string | null = null;
    if (mode === "register") {
      requirePolicyAcceptance(body.acceptedPolicies);
      // Bot protection happens at the send-code step; registering proves email ownership.
      emailCode = normalizeVerificationCode(body.emailCode);
    }
    const db = getDb();
    const token = newSessionToken();
    const oldToken = requestToken(request);
    const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
    let user: { id: number; username: string };
    if (mode === "register") {
      await checkVerificationCode(db, email, "register", emailCode!);
      const passwordHash = await hashPassword(password);
      try {
        user = await db.transaction(async (tx) => {
          const [created] = await tx
            .insert(users)
            .values({
              username: username!,
              password: passwordHash,
              email,
              phone: null,
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
          await consumeVerificationCode(tx, email, "register", emailCode!);
          return created;
        });
      } catch (error) {
        if (uniqueViolation(error))
          throw new AuthError(
            "该用户名或邮箱不可用于注册，请更换或尝试登录。",
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
        .where(eq(users.email, email))
        .limit(1);
      dummyHash ??= hashPassword(newSessionToken());
      const valid = await verifyPassword(
        password,
        found?.password || (await dummyHash),
      );
      if (!found || !valid)
        throw new AuthError("邮箱或密码不正确。", 401);
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
    if (mode === "register") {
      try {
        await sendWelcomeEmail(
          email,
          user.username,
          new URL(request.url).origin,
        );
      } catch {
        // Registration succeeds even when the optional welcome email is unavailable.
        console.error("Welcome email unavailable");
      }
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

/** Validated server session; callers must never accept a client-supplied owner ID. */
export async function getCurrentUser(request: Request) {
  if (!authConfigured()) return null;
  const token = requestToken(request);
  if (!token) return null;
  const [user] = await getDb().select({ id: users.id, username: users.username })
    .from(sessions).innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, digest(`session:${token}`)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return user || null;
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
