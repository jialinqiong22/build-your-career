const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;

type SiteverifyResponse = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
};

export type TurnstileVerification =
  | { ok: true }
  | { ok: false; reason: "invalid" | "misconfigured" | "unavailable" };

type VerifyOptions = {
  token: unknown;
  secret: string | undefined;
  expectedHostname: string;
  expectedAction: string;
  fetcher?: typeof fetch;
};

function normalizedHostname(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

export async function verifyTurnstile({
  token,
  secret,
  expectedHostname,
  expectedAction,
  fetcher = fetch,
}: VerifyOptions): Promise<TurnstileVerification> {
  if (!secret?.trim()) return { ok: false, reason: "misconfigured" };
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_TOKEN_LENGTH
  )
    return { ok: false, reason: "invalid" };

  try {
    const response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, reason: "unavailable" };

    const data = (await response.json()) as SiteverifyResponse;
    const hostname =
      typeof data.hostname === "string" ? normalizedHostname(data.hostname) : "";
    if (
      data.success !== true ||
      data.action !== expectedAction ||
      hostname !== normalizedHostname(expectedHostname)
    )
      return { ok: false, reason: "invalid" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
