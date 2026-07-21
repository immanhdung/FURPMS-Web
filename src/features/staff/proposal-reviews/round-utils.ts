import type { TFunction } from "i18next";
import type { ReviewRound } from "@/types/review-round";

export type RoundBucket = "not_started" | "in_progress" | "completed";

export const ROUND_BUCKETS: { id: RoundBucket; labelKey: string }[] = [
  { id: "not_started", labelKey: "staff.bucketNotStarted" },
  { id: "in_progress", labelKey: "staff.bucketInProgress" },
  { id: "completed", labelKey: "staff.bucketCompleted" },
];

/** The round status string is undocumented, so bucket by the more reliable opened/closed timestamps. */
export function getRoundBucket(round: ReviewRound): RoundBucket {
  if (round.closedAt) return "completed";
  if (round.openedAt) return "in_progress";
  return "not_started";
}

export function roundTitle(round: ReviewRound, t: TFunction) {
  return `${t("staff.round", { num: round.roundNumber })}${round.roundType ? ` · ${round.roundType}` : ""}`;
}
