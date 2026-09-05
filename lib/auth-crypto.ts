import { createHmac, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export const BCRYPT_COST = 12;
export const hashPassword = (password: string) =>
  bcrypt.hash(password, BCRYPT_COST);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
export const newSessionToken = () => randomBytes(32).toString("hex");
export const validSessionToken = (token: unknown): token is string =>
  typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
export function privateDigest(value: string, secret: string) {
  if (Buffer.byteLength(secret) < 32)
    throw Error("Auth secret must be at least 32 bytes");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function authCookieName(
  production = process.env.NODE_ENV === "production",
) {
  return production ? "__Host-career_session" : "career_session";
}
export function sessionCookie(
  token: string,
  clear = false,
  production = process.env.NODE_ENV === "production",
) {
  if (!clear && !validSessionToken(token)) throw Error("Invalid session token");
  return `${authCookieName(production)}=${clear ? "" : token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : SESSION_SECONDS}${production ? "; Secure" : ""}`;
}
export function requestToken(request: Request) {
  const matches = (request.headers.get("cookie") || "")
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x.startsWith(`${authCookieName()}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(authCookieName().length + 1);
  return validSessionToken(token) ? token : null;
}
