"use client";
import InviteCreator from "./InviteCreator";
export default function EvidenceFeedback({
  evidenceItemId,
  summary,
}: {
  evidenceItemId: string;
  summary: string;
}) {
  return (
    <InviteCreator kind="feedback" payload={{ evidenceItemId, summary }} />
  );
}
