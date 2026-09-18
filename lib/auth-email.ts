import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "./db";
import { emailVerificationCodes, sessions, users } from "./db/schema";
import {
  AuthError,
  normalizeEmail,
  validatePassword,
  readAuthBody,
} from "./auth-validation";
import {
  hashPassword,
  requestToken,
  sessionCookie,
  verifyPassword,
} from "./auth-crypto";
import { sameOrigin } from "./request-origin";
import { verifyTurnstile } from "./turnstile";
import { sendVerificationCodeEmail } from "./email";
import {
  CODE_MAX_ATTEMPTS,
  CODE_RESEND_INTERVAL_SECONDS,
  CODE_TTL_SECONDS,
  newVerificationCode,
  normalizePurpose,
  normalizeVerificationCode,
  verificationCodeDigest,
  type VerificationPurpose,
} from "./auth-email-crypto";
import {
  assertConfigured,
  digest,
  errorResponse,
  rateLimit,
  requestSource,
  responseHeaders,
} from "./auth-helpers";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
type DbClient = ReturnType<typeof getDb> | Tx;

const codeHash = (purpose: VerificationPurpose, email: string, code: string) =>
  verificationCodeDigest(purpose, email, code, process.env.AUTH_SECRET || "");

async function requireHumanVerification(request: Request, token: unknown) {
  const verification = await verifyTurnstile({
    token,
    secret: process.env.TURNSTILE_SECRET_KEY,
    expectedHostname: new URL(request.url).hostname,
    expectedAction: "code",
  });
  if (!verification.ok) {
    if (verification.reason === "misconfigured")
      throw new AuthError("邮箱验证尚未配置，请稍后再试。", 503);
    if (verification.reason === "unavailable")
      throw new AuthError("人机验证服务暂时不可用，请稍后重试。", 503);
    throw new AuthError("人机验证无效或已过期，请重新验证。", 403);
  }
}

/**
 * Sends a 6-digit code. The response never reveals whether the address is
 * registered; password-reset codes are only mailed to existing accounts.
 */
export async function issueVerificationCode(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("请求来源无效。", 403);
    assertConfigured();
    const body = await readAuthBody(request);
    const email = normalizeEmail(body.identifier);
    const purpose = normalizePurpose(body.purpose);
    await rateLimit(`code:source:${requestSource(request)}`, 20, 900);
    await rateLimit(`code:email:${email}`, 3, 900);
    await requireHumanVerification(request, body.turnstileToken);
    const db = getDb();
    if (purpose === "password_reset") {
      const [account] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!account)
        return Response.json({ ok: true }, { headers: responseHeaders });
    }
    const [existing] = await db
      .select({ createdAt: emailVerificationCodes.createdAt })
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.purpose, purpose),
        ),
      )
      .limit(1);
    if (existing) {
      const elapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (elapsed < CODE_RESEND_INTERVAL_SECONDS)
        throw new AuthError(
          "验证码发送过于频繁，请稍后再试。",
          429,
          Math.ceil(CODE_RESEND_INTERVAL_SECONDS - elapsed),
        );
    }
    const code = newVerificationCode();
    const now = new Date();
    await db
      .insert(emailVerificationCodes)
      .values({
        email,
        purpose,
        codeHash: codeHash(purpose, email, code),
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + CODE_TTL_SECONDS * 1000),
      })
      .onConflictDoUpdate({
        target: [emailVerificationCodes.email, emailVerificationCodes.purpose],
        set: {
          codeHash: codeHash(purpose, email, code),
          attempts: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + CODE_TTL_SECONDS * 1000),
        },
      });
    try {
      const delivery = await sendVerificationCodeEmail(email, code, purpose);
      if (delivery !== "sent")
        throw new Error("Verification email is not configured");
    } catch {
      // The code is already stored; resending is throttled, so fail loudly.
      console.error("Verification email unavailable");
      throw new AuthError("验证邮件暂时无法发送，请稍后重试。", 503);
    }
    return Response.json({ ok: true }, { headers: responseHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Pre-transaction check; a mismatched attempt is persisted outside any rollback. */
export async function checkVerificationCode(
  db: DbClient,
  email: string,
  purpose: VerificationPurpose,
  code: string,
) {
  const [row] = await db
    .select()
    .from(emailVerificationCodes)
    .where(
      and(
        eq(emailVerificationCodes.email, email),
        eq(emailVerificationCodes.purpose, purpose),
      ),
    )
    .limit(1);
  if (
    !row ||
    row.attempts >= CODE_MAX_ATTEMPTS ||
    row.expiresAt.getTime() <= Date.now()
  )
    throw new AuthError("验证码无效或已过期，请重新获取。", 400);
  if (row.codeHash !== codeHash(purpose, email, code)) {
    if (row.attempts + 1 >= CODE_MAX_ATTEMPTS) {
      await db
        .delete(emailVerificationCodes)
        .where(
          and(
            eq(emailVerificationCodes.email, email),
            eq(emailVerificationCodes.purpose, purpose),
          ),
        );
    } else {
      await db
        .update(emailVerificationCodes)
        .set({ attempts: row.attempts + 1 })
        .where(
          and(
            eq(emailVerificationCodes.email, email),
            eq(emailVerificationCodes.purpose, purpose),
          ),
        );
    }
    throw new AuthError("验证码不正确，请重新输入。", 400);
  }
}

/** Atomic consume inside the caller's transaction; no-ops can never double-spend a code. */
export async function consumeVerificationCode(
  tx: Tx,
  email: string,
  purpose: VerificationPurpose,
  code: string,
) {
  const [used] = await tx
    .delete(emailVerificationCodes)
    .where(
      and(
        eq(emailVerificationCodes.email, email),
        eq(emailVerificationCodes.purpose, purpose),
        eq(emailVerificationCodes.codeHash, codeHash(purpose, email, code)),
        gt(emailVerificationCodes.expiresAt, new Date()),
      ),
    )
    .returning({ email: emailVerificationCodes.email });
  if (!used)
    throw new AuthError("验证码无效或已过期，请重新获取。", 400);
}

export async function resetPassword(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("请求来源无效。", 403);
    assertConfigured();
    await rateLimit(`reset:source:${requestSource(request)}`, 10, 900);
    const body = await readAuthBody(request);
    const email = normalizeEmail(body.identifier);
    const code = normalizeVerificationCode(body.emailCode);
    const password = validatePassword(body.password);
    await rateLimit(`reset:identity:${email}`, 5, 900);
    const db = getDb();
    await checkVerificationCode(db, email, "password_reset", code);
    const passwordHash = await hashPassword(password);
    await db.transaction(async (tx) => {
      await consumeVerificationCode(tx, email, "password_reset", code);
      const [updated] = await tx
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.email, email))
        .returning({ id: users.id });
      // Reset invalidates every existing session on every device.
      await tx.delete(sessions).where(eq(sessions.userId, updated.id));
    });
    return Response.json({ ok: true }, { headers: responseHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function deleteAccount(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("请求来源无效。", 403);
    assertConfigured();
    const token = requestToken(request);
    if (!token) throw new AuthError("请先登录后再操作。", 401);
    await rateLimit(`delete:source:${requestSource(request)}`, 5, 900);
    const body = await readAuthBody(request);
    if (typeof body.password !== "string" || body.password === "")
      throw new AuthError("请输入密码以确认注销。");
    const db = getDb();
    const [account] = await db
      .select({ id: users.id, password: users.password })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, digest(`session:${token}`)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!account)
      throw new AuthError("登录状态已过期，请重新登录后再试。", 401);
    if (!(await verifyPassword(body.password, account.password)))
      throw new AuthError("密码不正确，账号未注销。", 403);
    await rateLimit(`delete:user:${account.id}`, 3, 900);
    await db.delete(users).where(eq(users.id, account.id));
    return Response.json(
      { user: null },
      {
        headers: {
          ...responseHeaders,
          "Set-Cookie": sessionCookie("", true),
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
