import { createHmac, timingSafeEqual } from "node:crypto";

export const PREMIUM_PRODUCT = "career-complete-199";
export const PREMIUM_COOKIE = "career_premium_access";
export const SESSION_SECONDS = 24 * 60 * 60;
export type PremiumGrant = {
  v: 1;
  kind: "code" | "session";
  order: string;
  product: typeof PREMIUM_PRODUCT;
  exp: number;
};

function secret(): string {
  const value = process.env.PREMIUM_ACCESS_SECRET;
  if (!value || Buffer.byteLength(value, "utf8") < 32)
    throw new Error("Premium access is not configured");
  return value;
}
export function premiumConfigured(): boolean {
  try {
    secret();
    return true;
  } catch {
    return false;
  }
}
function validGrant(value: unknown): value is PremiumGrant {
  if (!value || typeof value !== "object") return false;
  const grant = value as PremiumGrant;
  return (
    Object.keys(grant).sort().join(",") === "exp,kind,order,product,v" &&
    grant.v === 1 &&
    (grant.kind === "code" || grant.kind === "session") &&
    grant.product === PREMIUM_PRODUCT &&
    typeof grant.order === "string" &&
    /^[A-Za-z0-9_-]{1,80}$/.test(grant.order) &&
    Number.isSafeInteger(grant.exp) &&
    grant.exp > 0 &&
    grant.exp <= 253402300799
  );
}
function revoked(order: string): boolean {
  return (process.env.PREMIUM_REVOKED_ORDERS ?? "")
    .split(",")
    .map((value) => value.trim())
    .includes(order);
}
function sign(grant: PremiumGrant): string {
  const body = Buffer.from(JSON.stringify(grant)).toString("base64url");
  return `${body}.${createHmac("sha256", secret()).update(body).digest("base64url")}`;
}
export function issueAccessCode(
  order: string,
  expiresAt: number,
  now = Math.floor(Date.now() / 1000),
): string {
  const grant: PremiumGrant = {
    v: 1,
    kind: "code",
    order,
    product: PREMIUM_PRODUCT,
    exp: expiresAt,
  };
  if (!validGrant(grant) || expiresAt <= now || revoked(order))
    throw new Error("Invalid order or expiry");
  return sign(grant);
}
export function verifyPremiumToken(
  token: string | undefined,
  kind: PremiumGrant["kind"],
  now = Math.floor(Date.now() / 1000),
): PremiumGrant | null {
  if (!premiumConfigured() || !token || token.length > 1024) return null;
  const parts = token.split(".");
  if (
    parts.length !== 2 ||
    !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
  )
    return null;
  const [body, signature] = parts;
  const actual = Buffer.from(signature, "base64url");
  const expected = createHmac("sha256", secret()).update(body).digest();
  if (
    actual.length !== expected.length ||
    actual.toString("base64url") !== signature ||
    !timingSafeEqual(actual, expected)
  )
    return null;
  try {
    const grant: unknown = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    );
    if (
      !validGrant(grant) ||
      grant.kind !== kind ||
      grant.exp <= now ||
      revoked(grant.order)
    )
      return null;
    if (kind === "session" && grant.exp > now + SESSION_SECONDS) return null;
    return grant;
  } catch {
    return null;
  }
}
export function createPremiumSession(
  code: string,
  now = Math.floor(Date.now() / 1000),
): { token: string; expiresAt: number; maxAge: number } | null {
  const grant = verifyPremiumToken(code, "code", now);
  if (!grant) return null;
  const expiresAt = Math.min(grant.exp, now + SESSION_SECONDS);
  return {
    token: sign({ ...grant, kind: "session", exp: expiresAt }),
    expiresAt,
    maxAge: expiresAt - now,
  };
}
/** Use in every protected API; never trust a client-side paid flag. */
export function premiumAccessFromRequest(
  request: Request,
): PremiumGrant | null {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${PREMIUM_COOKIE}=`));
  return verifyPremiumToken(
    cookie?.slice(PREMIUM_COOKIE.length + 1),
    "session",
  );
}
