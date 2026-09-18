import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { getDb, authConfigured } from "./db";
import { authLimits } from "./db/schema";
import { getCurrentUser } from "./auth";
import { socialInvites } from "./social-schema";
import { sameOrigin } from "./request-origin";
import {
  validScores,
  validFeedback,
  socialView,
  type SocialData,
} from "./social-validation";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const token = () => randomBytes(32).toString("base64url");
const validToken = (s: unknown): s is string =>
  typeof s === "string" && /^[A-Za-z0-9_-]{43}$/.test(s);
const headers = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
const reply = (data: object, status = 200) =>
  Response.json(data, { status, headers });
export const socialConfigured = () =>
  process.env.SOCIAL_ENABLED === "true" && authConfigured();
class Invalid extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Invalid("请使用JSON请求。", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new Invalid("请求为空。");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 12000) {
        await reader.cancel();
        throw new Invalid("请求过大。", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!result || typeof result !== "object" || Array.isArray(result))
    throw new Invalid("请求格式无效。");
  return result;
}
async function limit(key: string) {
  const now = new Date();
  const expires = new Date(now.getTime() + 900000);
  const [row] = await getDb()
    .insert(authLimits)
    .values({ key: hash(`social:${key}`), hits: 1, expiresAt: expires })
    .onConflictDoUpdate({
      target: authLimits.key,
      set: {
        hits: sql`CASE WHEN ${authLimits.expiresAt} <= ${now} THEN 1 ELSE ${authLimits.hits}+1 END`,
        expiresAt: sql`CASE WHEN ${authLimits.expiresAt} <= ${now} THEN ${expires} ELSE ${authLimits.expiresAt} END`,
      },
    })
    .returning();
  if (row.hits > 60) throw new Invalid("操作频繁，请15分钟后再试。", 429);
}
export async function handleSocial(request: Request, inviteToken?: string) {
  if (!socialConfigured())
    return reply(
      { configured: false, error: "邀请服务尚未开放。" },
      request.method === "GET" && !inviteToken ? 200 : 503,
    );
  if (request.method === "GET" && !inviteToken)
    return reply({ configured: true });
  try {
    if (request.method !== "GET" && !sameOrigin(request))
      throw new Invalid("请求来源无效。", 403);
    if (inviteToken && !validToken(inviteToken))
      throw new Invalid("邀请不存在。", 404);
    const data = request.method === "GET" ? {} : await body(request);
    const user = await getCurrentUser(request);
    if (!inviteToken) {
      await limit(
        `create:${user?.id ?? (process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") : "anonymous")}`,
      );
      const kind = data.kind;
      if (kind !== "compare" && kind !== "feedback")
        throw new Invalid("邀请类型无效。");
      if (data.consent !== true)
        throw new Invalid("请先确认邀请内容和数据说明。");
      if (kind === "compare" && !validScores(data.scores))
        throw new Invalid("请先完成大五测评。");
      if (kind === "feedback" && !user)
        throw new Invalid("请先登录以管理反馈邀请。", 401);
      if (
        kind === "feedback" &&
        (typeof data.evidenceItemId !== "string" ||
          !/^[A-Za-z0-9_-]{1,100}$/.test(data.evidenceItemId) ||
          typeof data.summary !== "string" ||
          data.summary.trim().length < 10 ||
          data.summary.length > 2000)
      )
        throw new Invalid("请提供一条具体经历摘要（10—2000字）。");
      const publicToken = token(),
        ownerSecret = token();
      const expiresAt = new Date(
        Date.now() + (kind === "compare" ? 7 : 30) * 86400000,
      );
      const payload: SocialData =
        kind === "compare"
          ? { initiatorScores: data.scores as SocialData["initiatorScores"] }
          : {
              evidenceItemId: data.evidenceItemId as string,
              summary: (data.summary as string).trim(),
            };
      await getDb()
        .insert(socialInvites)
        .values({
          tokenHash: hash(publicToken),
          ownerHash: hash(ownerSecret),
          ownerUserId: user?.id,
          kind,
          status: kind === "compare" ? "pending_assessment" : "open",
          data: payload,
          expiresAt,
        });
      return reply(
        { token: publicToken, ownerSecret, expiresAt: expiresAt.toISOString() },
        201,
      );
    }
    const secret = request.headers.get("x-social-secret");
    const secretHash = validToken(secret) ? hash(secret) : null;
    if (request.method !== "GET") await limit(`invite:${hash(inviteToken)}`);
    return await getDb().transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(socialInvites)
        .where(eq(socialInvites.tokenHash, hash(inviteToken)))
        .for("update");
      if (!row) throw new Invalid("邀请不存在或已清理。", 404);
      let role: "owner" | "participant" | "visitor" =
        secretHash && secretHash === row.ownerHash
          ? "owner"
          : secretHash && secretHash === row.participantHash
            ? "participant"
            : "visitor";
      if (role === "owner" && row.ownerUserId && row.ownerUserId !== user?.id)
        throw new Invalid("请登录创建邀请的账号。", 401);
      if (request.method === "GET") {
        await tx
          .update(socialInvites)
          .set({ lastAccessedAt: new Date() })
          .where(eq(socialInvites.tokenHash, row.tokenHash));
        return reply(socialView(row, role));
      }
      const action = data.action;
      // Respondent deletion remains available after expiry or owner revocation.
      if (action === "delete_response" && row.kind === "feedback") {
        if (
          !validToken(data.receipt) ||
          hash(data.receipt) !== row.data.responseDeleteHash
        )
          throw new Invalid("删除凭据无效。", 403);
        const clean = { ...row.data };
        delete clean.answers;
        delete clean.responseDeleteHash;
        delete clean.submittedAt;
        await tx
          .update(socialInvites)
          .set({ data: clean, status: "closed", updatedAt: new Date() })
          .where(eq(socialInvites.tokenHash, row.tokenHash));
        return reply({ deleted: true });
      }
      if (
        row.expiresAt.getTime() <= Date.now() ||
        ["revoked", "declined"].includes(row.status)
      )
        throw new Invalid("邀请已到期或已撤回。", 410);
      let issuedSecret: string | undefined;
      let receipt: string | undefined;
      if (action === "revoke" && role !== "visitor") {
        row.status = "revoked";
        row.data[role === "owner" ? "initiatorRevokedAt" : "inviteeRevokedAt"] =
          new Date().toISOString();
      } else if (
        action === "bind" &&
        role === "owner" &&
        user &&
        !row.ownerUserId
      )
        row.ownerUserId = user.id;
      else if (row.kind === "compare") {
        if (
          action === "join" &&
          role === "visitor" &&
          row.status === "pending_assessment" &&
          data.consent === true &&
          validScores(data.scores)
        ) {
          issuedSecret = token();
          row.participantHash = hash(issuedSecret);
          role = "participant";
          row.data = {
            ...row.data,
            inviteeScores: data.scores,
            inviteeConsentAt: new Date().toISOString(),
          };
          row.status = "pending_initiator_consent";
        } else if (
          action === "confirm" &&
          role === "owner" &&
          row.status === "pending_initiator_consent" &&
          data.consent === true
        ) {
          row.data.initiatorConsentAt = new Date().toISOString();
          row.status = "active";
        } else if (action === "decline" && role !== "visitor")
          row.status = "declined";
        else throw new Invalid("当前状态不允许此操作。", 403);
      } else if (
        action === "respond" &&
        role === "visitor" &&
        row.status === "open" &&
        data.consent === true &&
        validFeedback(data.answers)
      ) {
        receipt = token();
        row.data = {
          ...row.data,
          answers: data.answers.map((v) => v.trim()),
          submittedAt: new Date().toISOString(),
          responseDeleteHash: hash(receipt),
        };
        row.status = "submitted";
      } else throw new Invalid("当前状态不允许此操作。", 403);
      await tx
        .update(socialInvites)
        .set({
          data: row.data,
          status: row.status,
          ownerUserId: row.ownerUserId,
          participantHash: row.participantHash,
          updatedAt: new Date(),
        })
        .where(eq(socialInvites.tokenHash, row.tokenHash));
      return reply({
        ...socialView(row, role),
        ...(issuedSecret ? { participantSecret: issuedSecret } : {}),
        ...(receipt ? { receipt } : {}),
      });
    });
  } catch (error) {
    if (error instanceof Invalid)
      return reply({ error: error.message }, error.status);
    if (error instanceof SyntaxError)
      return reply({ error: "请求格式无效。" }, 400);
    return reply({ error: "邀请服务暂时不可用，请稍后重试。" }, 503);
  }
}
