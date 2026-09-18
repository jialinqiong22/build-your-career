import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { authConfigured, getDb } from "@/lib/db";
import { assessmentProgress as progress } from "@/lib/db/progress-schema";
import { sameOrigin } from "@/lib/request-origin";
import {
  isProgressKind,
  validProgressPayload,
  validProgressRevision,
} from "@/lib/progress-validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers });
async function handle(request: Request) {
  try {
    if (request.method !== "GET" && !sameOrigin(request))
      return reply({ error: "请求来源无效。" }, 403);
    if (!authConfigured())
      return reply({ error: "云端保存服务尚未配置。" }, 503);
    const user = await getCurrentUser(request);
    if (!user) return reply({ error: "请先登录。" }, 401);
    const kind = new URL(request.url).searchParams.get("kind");
    if (request.method === "GET") {
      if (kind !== null && !isProgressKind(kind))
        return reply({ error: "测评类型无效。" }, 400);
      const records = await getDb()
        .select({
          kind: progress.kind,
          payload: progress.payload,
          revision: progress.revision,
          updatedAt: progress.updatedAt,
        })
        .from(progress)
        .where(
          kind
            ? and(eq(progress.userId, user.id), eq(progress.kind, kind))
            : eq(progress.userId, user.id),
        );
      return reply({ records });
    }
    // Bound bytes while streaming, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "请求为空。" }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 85000) {
        await reader.cancel();
        return reply({ error: "记录过大。" }, 413);
      }
      chunks.push(chunk.value);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return reply({ error: "记录格式无效。" }, 400);
    }
    if (
      !body ||
      !isProgressKind(body.kind) ||
      !validProgressRevision(body.revision)
    )
      return reply({ error: "记录格式无效。" }, 400);
    const owner = and(
      eq(progress.userId, user.id),
      eq(progress.kind, body.kind),
      eq(
        progress.revision,
        body.revision === 0
          ? "00000000-0000-4000-8000-000000000000"
          : body.revision,
      ),
    );
    if (request.method === "DELETE") {
      const deleted = await getDb()
        .delete(progress)
        .where(owner)
        .returning({ kind: progress.kind });
      return deleted.length
        ? reply({ deleted: true })
        : reply({ error: "云端记录已变化，请重新加载后删除。" }, 409);
    }
    if (body.consent !== true || !validProgressPayload(body.payload))
      return reply({ error: "请明确同意云端保存，并检查记录格式。" }, 400);
    const saved =
      body.revision === 0
        ? await getDb()
            .insert(progress)
            .values({ userId: user.id, kind: body.kind, payload: body.payload })
            .onConflictDoNothing()
            .returning()
        : await getDb()
            .update(progress)
            .set({
              payload: body.payload,
              revision: randomUUID(),
              updatedAt: new Date(),
            })
            .where(owner)
            .returning();
    if (!saved.length)
      return reply(
        {
          error:
            "另一处已更新云端记录。本次未覆盖，请先恢复云端或重新查看版本。",
        },
        409,
      );
    return reply({
      record: {
        kind: saved[0].kind,
        revision: saved[0].revision,
        updatedAt: saved[0].updatedAt,
      },
    });
  } catch {
    return reply({ error: "云端记录暂时不可用，请保留本机记录后重试。" }, 503);
  }
}
export const GET = handle;
export const PUT = handle;
export const DELETE = handle;
