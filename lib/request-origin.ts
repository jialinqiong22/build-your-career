// Next.js may normalize request.url to its listening hostname. The browser's
// Origin must instead match the HTTP Host received by this deployment.
export function sameOrigin(request: Request): boolean {
  const raw = request.headers.get("origin");
  if (!raw || raw === "null") return false;
  try {
    const origin = new URL(raw);
    return (
      raw === origin.origin &&
      origin.host === request.headers.get("host") &&
      origin.protocol === new URL(request.url).protocol
    );
  } catch {
    return false;
  }
}
