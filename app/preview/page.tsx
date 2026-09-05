import { notFound } from "next/navigation";
import PositioningSuite from "@/components/PositioningSuite";
import { questions120 } from "@/lib/bigfive/data120";
import { enneagramQuestions } from "@/lib/instruments";
export const dynamic = "force-dynamic";
export default function LocalPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <PositioningSuite
      previewBanks={{ bigFive: questions120, enneagram: enneagramQuestions }}
    />
  );
}
