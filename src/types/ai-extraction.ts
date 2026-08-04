/**
 * Kết quả AI trích xuất đề cương — khớp `ExtractedProposalDto` của BE
 * (`POST /api/proposals/extract`).
 *
 * Trước đây type này khai `keywords` / `researchArea` / `abstractEN` — những field
 * BE **chưa bao giờ trả**; ngược lại 4 field BE có (`researchObjectives`,
 * `methodology`, `expectedOutput`, `durationMonths`) thì FE bỏ phí, trong đó
 * objectives + durationMonths lại là **bắt buộc** ở bước 2 của wizard.
 */
export interface AiExtractionResult {
  titleVi?: string | null;
  titleEn?: string | null;
  abstractVi?: string | null;
  researchObjectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  durationMonths?: number | null;
  totalBudget?: number | null;
  /** BE báo lại khi chưa cấu hình AI hoặc đọc file không ra gì — vẫn cho nhập tay (rule #20). */
  warning?: string | null;
}

export interface SimilarityCheckResult {
  score: number;
  passed: boolean;
}
