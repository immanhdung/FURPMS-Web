import type { TFunction } from "i18next";

interface RoundLike {
  id: string;
  roundNumber: number;
  roundType: string;
}

/**
 * Số phiên của vòng TRONG CÙNG LOẠI (01/10).
 *
 * <p>`roundNumber` đếm chung mọi loại trong một (đợt + lĩnh vực): xét duyệt 1, nghiệm thu 2,
 * nghiệm thu 3… Hiện "Vòng 3" làm người xem tưởng đề tài phải qua 3 vòng, trong khi QĐ543 chỉ có
 * hội đồng xét duyệt và hội đồng nghiệm thu. Một "vòng" thực chất là một PHIÊN chấm cho một nhóm đề
 * tài cùng loại, mở thêm khi nhiều đề tài quá hoặc đề tài nộp muộn.</p>
 */
export function roundSessionNo(round: RoundLike, all: RoundLike[]): number {
  return all.filter((r) => r.roundType === round.roundType && r.roundNumber <= round.roundNumber).length || 1;
}

/** "Xét duyệt đề cương · phiên 1" */
export function roundLabel(t: TFunction, round: RoundLike, all: RoundLike[]): string {
  return `${t(`reviewBoard.type.${round.roundType}`)} · ${t("reviewBoard.session", { n: roundSessionNo(round, all) })}`;
}

/** Vòng đã có kết quả (PASSED/FAILED) hiện là "Đã chốt" — "Đạt" trên cả một phiên nhiều đề tài là sai nghĩa. */
export function roundStatusKey(status?: string | null): string {
  return status === "PASSED" || status === "FAILED" ? "FINALIZED" : (status ?? "");
}
