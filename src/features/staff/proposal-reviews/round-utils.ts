import type { TFunction } from "i18next";
import type { ReviewRound } from "@/types/review-round";

export type RoundBucket = "not_started" | "in_progress" | "completed";

export const ROUND_BUCKETS: { id: RoundBucket; labelKey: string }[] = [
  { id: "not_started", labelKey: "staff.bucketNotStarted" },
  { id: "in_progress", labelKey: "staff.bucketInProgress" },
  { id: "completed", labelKey: "staff.bucketCompleted" },
];

/**
 * Xếp cột Kanban theo góc nhìn CỦA ĐỀ TÀI NÀY.
 * BE trả `status` đã đè bằng project_round.Status (kết quả riêng của đề tài trong vòng),
 * nên khi Chủ tịch duyệt biên bản → PASSED/FAILED thì đề tài coi như XONG cột "Hoàn thành",
 * kể cả khi vòng chung (dùng chung cả lĩnh vực) chưa đóng vì còn đề tài khác đang chờ.
 * REVISION_REQUIRED giữ vòng OPEN (rule #1) → vẫn nằm "đang tiến hành".
 */
export function getRoundBucket(round: ReviewRound): RoundBucket {
  const status = round.status?.toUpperCase();
  if (round.closedAt || status === "PASSED" || status === "FAILED") return "completed";
  if (round.openedAt) return "in_progress";
  return "not_started";
}

export function roundTitle(round: ReviewRound, t: TFunction) {
  return `${t("staff.round", { num: round.roundNumber })}${round.roundType ? ` · ${round.roundType}` : ""}`;
}
