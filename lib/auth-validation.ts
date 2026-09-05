export type Identifier = { kind: "email" | "phone"; value: string };

export class AuthError extends Error {
  status: number;
  retryAfter?: number;
  constructor(message: string, status = 400, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function normalizeIdentifier(input: unknown): Identifier {
  if (typeof input !== "string" || input.length > 254)
    throw new AuthError("请输入有效的手机号或邮箱。");
  const value = input.trim();
  if (value.includes("@")) {
    const email = value.toLowerCase();
    const parts = email.split("@");
    if (
      parts.length !== 2 ||
      parts[0].length > 64 ||
      !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(
        email,
      )
    )
      throw new AuthError("请输入有效的邮箱地址。");
    return { kind: "email", value: email };
  }
  const compact = value.replace(/[ ()-]/g, "");
  const phone = /^1[3-9]\d{9}$/.test(compact) ? `+86${compact}` : compact;
  if (
    !/^\+[1-9]\d{7,14}$/.test(phone) ||
    (phone.startsWith("+86") && !/^\+861[3-9]\d{9}$/.test(phone))
  )
    throw new AuthError("请输入大陆11位手机号，或带 +国家区号的完整号码。");
  return { kind: "phone", value: phone };
}

export function normalizeUsername(input: unknown): string {
  if (typeof input !== "string") throw new AuthError("请输入用户名。");
  const name = input.trim().normalize("NFC");
  if (!/^[\p{L}\p{N}_-]{2,30}$/u.test(name))
    throw new AuthError("用户名需为2–30个文字、数字、下划线或短横线。");
  return name;
}

export function validatePassword(input: unknown): string {
  if (
    typeof input !== "string" ||
    [...input].length < 12 ||
    Buffer.byteLength(input, "utf8") > 72 ||
    input.includes("\0")
  )
    throw new AuthError(
      "密码至少12个字符，最多72个UTF-8字节；中文和表情会占用多个字节。",
    );
  return input; // Deliberately do not trim or normalize passwords.
}

export async function readAuthBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new AuthError("请使用JSON提交。", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError("请求内容为空。");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new AuthError("请求内容过大。", 413);
    }
    chunks.push(value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Error();
    return body;
  } catch {
    throw new AuthError("请求内容格式无效。");
  }
}
