import type { CouncilMember } from "@/types/council-member";

export interface ReviewRound {
  id: string;
  roundNumber: number;
  dimension?: string | null;
  roundType?: string | null;
  rubricTemplateId?: number | null;
  sequence: number;
  prerequisiteRoundId?: string | null;
  status?: string | null;
  openedAt?: string | null;
  closedAt?: string | null;
  result?: string | null;
  /**
   * Hạn hội đồng phải chấm xong vòng này (thêm 25/08). `null` = chưa đặt hạn — vòng tạo trước
   * ngày đó đều vậy, giao diện hiện "chưa đặt hạn" chứ KHÔNG bịa ra một ngày.
   *
   * Đây là hạn HIỆU LỰC: đã tính các lần Staff dời hạn (rule #19 — dời là ghi log, không ghi đè).
   */
  scoringDeadline?: string | null;
  /** Vòng còn mở mà đã quá hạn. Chỉ gắn cờ — hệ thống KHÔNG tự đóng vòng (rule #12). */
  isScoringOverdue?: boolean;
  councilId?: string | null;
  members?: CouncilMember[] | null;
}

export interface CreateReviewRoundPayload {
  dimension: string;
  roundType?: string;
  rubricTemplateId?: number;
  prerequisiteRoundId?: string;
}

export interface CloseRoundPayload {
  result?: string;
  /**
   * Only required when the round has multiple proposals (Phase B: one round can host several
   * councils, each grading a different proposal) — confirmed via a live 400 asking for it.
   * The staff proposal detail already has this exact proposal in view, so it's passed
   * automatically rather than asking the user to look it up.
   */
  proposalProjectId?: string;
}
