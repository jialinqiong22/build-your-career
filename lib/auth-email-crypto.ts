import { randomInt } from "node:crypto";
import { privateDigest } from "./auth-crypto.ts";
import { AuthError } from "./auth-validation.ts";

export const CODE_TTL_SECONDS = 600;
export const CODE_MAX_ATTEMPTS = 5;
export const CODE_RESEND_INTERVAL_SECONDS = 60;

export type VerificationPurpose = "register" | "password_reset";

export function normalizePurpose(input: unknown): VerificationPurpose {
  if (input === "register" || input === "password_reset") return input;
  throw new AuthError("请选择验证码用途。");
}

export const newVerificationCode = () =>
  String(randomInt(0, 1_000_000)).padStart(6, "0");

export function normalizeVerificationCode(input: unknown): string {
  if (typeof input !== "string" || !/^\d{6}$/.test(input.trim()))
    throw new AuthError("请输入 6 位数字验证码。");
  return input.trim();
}

/** Codes are stored only as namespaced HMAC digests, like sessions. */
export function verificationCodeDigest(
  purpose: VerificationPurpose,
  email: string,
  code: string,
  secret: string,
) {
  return privateDigest(`code:${purpose}:${email}:${code}`, secret);
}
