import { createHmac, timingSafeEqual } from "node:crypto";

export const PREMIUM_PRODUCT = "career-complete-199";
export const PREMIUM_COOKIE = "career_premium_access";
export const SESSION_SECONDS = 24 * 60 * 60;
export type PaidPlan = "standard" | "guided";
export type PremiumGrant = {
  v: 1 | 2;
  kind: "code" | "session";
  order: string;
  product: typeof PREMIUM_PRODUCT | "career-standard-9.9" | "career-guided-99";
  exp: number;
  userId?: number;
};
export function planForGrant(grant: PremiumGrant | null): "free" | PaidPlan {
  return !grant ? "free" : grant.product === "career-standard-9.9" ? "standard" : "guided";
}

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
    ((grant.v === 1 && Object.keys(grant).sort().join(",") === "exp,kind,order,product,v" && grant.product === PREMIUM_PRODUCT) ||
      (grant.v === 2 && Object.keys(grant).sort().join(",") === "exp,kind,order,product,userId,v" &&
       Number.isSafeInteger(grant.userId) && grant.userId! > 0 &&
       [PREMIUM_PRODUCT, "career-standard-9.9", "career-guided-99"].includes(grant.product))) &&
    (grant.kind === "code" || grant.kind === "session") &&
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
  userId?: number,
  plan: PaidPlan = "guided",
): string {
  const grant: PremiumGrant = {
    v: userId === undefined ? 1 : 2,
    kind: "code",
    order,
    product: userId === undefined ? PREMIUM_PRODUCT : plan === "standard" ? "career-standard-9.9" : "career-guided-99",
    exp: expiresAt,
    ...(userId === undefined ? {} : { userId }),
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
  userId: number,
  now = Math.floor(Date.now() / 1000),
): { token: string; expiresAt: number; maxAge: number } | null {
  const grant = verifyPremiumToken(code, "code", now);
  if (!grant || !ownsGrant(grant, userId)) return null;
  const expiresAt = Math.min(grant.exp, now + SESSION_SECONDS);
  return {
    token: sign({ ...grant, v: 2, userId, kind: "session", exp: expiresAt }),
    expiresAt,
    maxAge: expiresAt - now,
  };
}
/** Use in every protected API; never trust a client-side paid flag. */
export function premiumAccessFromRequest(
  request: Request,
  userId?: number,
): PremiumGrant | null {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${PREMIUM_COOKIE}=`));
  const grant = verifyPremiumToken(
    cookie?.slice(PREMIUM_COOKIE.length + 1),
    "session",
  );
  return grant && ownsGrant(grant, userId) ? grant : null;
}
// Old orders require an explicit owner assignment before being upgraded. Never
// let an unbound bearer code become claimable by a second logged-in account.
function ownsGrant(grant: PremiumGrant, userId: number | undefined): boolean {
  if (!Number.isSafeInteger(userId) || !userId || userId < 1) return false;
  if (grant.v === 2) return grant.userId === userId;
  try {
    const owners = JSON.parse(process.env.PREMIUM_LEGACY_ORDER_OWNERS || "{}");
    return Object.hasOwn(owners, grant.order) && owners[grant.order] === userId;
  } catch { return false; }
}
