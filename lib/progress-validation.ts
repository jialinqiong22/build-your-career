export const progressKinds = ["free50", "suite50", "suite120"] as const;
export type ProgressKind = (typeof progressKinds)[number];
export function validProgressRevision(value: unknown): value is string | 0 {
  return (
    value === 0 ||
    (typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ))
  );
}
export function isProgressKind(value: unknown): value is ProgressKind {
  return (
    typeof value === "string" &&
    (progressKinds as readonly string[]).includes(value)
  );
}
export function validProgressPayload(
  value: unknown,
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  let nodes = 0;
  function valid(item: unknown, depth: number): boolean {
    if (++nodes > 8000 || depth > 12) return false;
    if (item === null || typeof item === "boolean") return true;
    if (typeof item === "number") return Number.isFinite(item);
    if (typeof item === "string") return item.length <= 10000;
    if (Array.isArray(item))
      return (
        item.length <= 1000 && item.every((entry) => valid(entry, depth + 1))
      );
    if (item && typeof item === "object")
      return Object.entries(item).every(
        ([key, entry]) =>
          key.length <= 100 &&
          !["__proto__", "prototype", "constructor"].includes(key) &&
          valid(entry, depth + 1),
      );
    return false;
  }
  return (
    valid(value, 0) &&
    new TextEncoder().encode(JSON.stringify(value)).length <= 80000
  );
}
