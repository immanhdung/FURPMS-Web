import type { ReviewRound } from "@/types/review-round";

export type RoundBucket = "not_started" | "in_progress" | "completed";

export const ROUND_BUCKETS: { id: RoundBucket; label: string }[] = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

/** The round status string is undocumented, so bucket by the more reliable opened/closed timestamps. */
export function getRoundBucket(round: ReviewRound): RoundBucket {
  if (round.closedAt) return "completed";
  if (round.openedAt) return "in_progress";
  return "not_started";
}

export function roundTitle(round: ReviewRound) {
  return `Round ${round.roundNumber}${round.roundType ? ` · ${round.roundType}` : ""}`;
}
