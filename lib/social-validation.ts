export type SocialScores = Record<"O" | "C" | "E" | "A" | "N", number>;
export type SocialData = {
  initiatorScores?: SocialScores;
  inviteeScores?: SocialScores;
  initiatorConsentAt?: string;
  inviteeConsentAt?: string;
  initiatorRevokedAt?: string;
  inviteeRevokedAt?: string;
  evidenceItemId?: string;
  summary?: string;
  answers?: string[];
  responseDeleteHash?: string;
  submittedAt?: string;
};
export type SocialState = {
  kind: "compare" | "feedback";
  status: string;
  data: SocialData;
  expiresAt: Date;
};
export const feedbackPrompts = [
  "你亲眼看到对方做了什么？请尽量具体。",
  "哪一处对结果有帮助，或还有改进空间？",
  "哪些背景或限制条件值得补充？",
];
export function validScores(value: unknown): value is SocialScores {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const scores = value as Record<string, unknown>;
  return (
    Object.keys(scores).sort().join(",") === "A,C,E,N,O" &&
    Object.values(scores).every(
      (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100,
    )
  );
}
export function validFeedback(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (v) => typeof v === "string" && v.trim().length >= 2 && v.length <= 1000,
    )
  );
}
export function socialView(
  row: SocialState,
  role: "owner" | "participant" | "visitor",
  now = Date.now(),
) {
  const expired = row.expiresAt.getTime() <= now;
  const closed = expired || ["revoked", "declined"].includes(row.status);
  const base = {
    kind: row.kind,
    status: expired ? "expired" : row.status,
    expiresAt: row.expiresAt.toISOString(),
    role,
  };
  if (closed) return base;
  if (row.kind === "compare") {
    if (
      role !== "visitor" &&
      row.status === "active" &&
      row.data.initiatorConsentAt &&
      row.data.inviteeConsentAt
    )
      return {
        ...base,
        initiatorScores: row.data.initiatorScores,
        inviteeScores: row.data.inviteeScores,
      };
    return base;
  }
  return {
    ...base,
    summary: row.data.summary,
    prompts: feedbackPrompts,
    ...(role === "owner"
      ? {
          evidenceItemId: row.data.evidenceItemId,
          answers: row.data.answers,
          submittedAt: row.data.submittedAt,
        }
      : {}),
  };
}
