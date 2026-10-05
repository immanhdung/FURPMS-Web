import type { TFunction } from "i18next";
import type { ReviewRound } from "@/types/review-round";

export type RoundBucket = "not_started" | "in_progress" | "completed";

/**
 * Trạng thái trên timeline là trạng thái CỦA ĐỀ TÀI trong vòng, không phải trạng thái
 * vận hành chung của cả vòng cấp lĩnh vực. Vì vậy PASSED/FAILED là đã đi hết mốc này,
 * kể cả khi vòng chung vẫn đang chờ các đề tài khác.
 */
export function getRoundBucket(round: ReviewRound): RoundBucket {
  const status = round.status?.toUpperCase();
  if (round.closedAt || status === "PASSED" || status === "FAILED") return "completed";
  if (round.openedAt) return "in_progress";
  return "not_started";
}

export function roundTitle(round: ReviewRound, t: TFunction) {
  const type = round.roundType
    ? ` · ${t(`reviewBoard.type.${round.roundType}`, { defaultValue: round.roundType })}`
    : "";
  return `${t("staff.round", { num: round.roundNumber })}${type}`;
}
