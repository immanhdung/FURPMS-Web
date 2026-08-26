/** Rà trùng lặp đề cương — khớp `DuplicateCheckResponse` của BE. */

/** Mức nghiêm trọng — để xếp thứ tự xem, KHÔNG phải để chặn nộp. */
export type DuplicateSeverity = "LOW" | "WARN" | "HIGH";

/** Kết luận của Phòng QLKH sau khi xem. */
export type DuplicateVerdict = "NOT_DUPLICATE" | "NEEDS_REVISION" | "DUPLICATE";

export interface DuplicateMatch {
  proposalId: string;
  projectId: string;
  projectCode?: string | null;
  titleVi: string;
  piName?: string | null;
  cycleYear?: number | null;
  projectStatus?: string | null;
  /** Cosine similarity trong [0, 1] — tất định, cùng cặp luôn ra cùng số. */
  similarity: number;
  severity: DuplicateSeverity;
}

export interface DuplicateCheck {
  proposalId: string;
  titleVi: string;
  /** Đã vector hoá đề cương này chưa. */
  indexed: boolean;
  /** Số đề tài trong kho có vector để đối chiếu — cho biết kết quả đáng tin tới đâu. */
  corpusSize: number;
  warnThreshold: number;
  highThreshold: number;
  matches: DuplicateMatch[];
  /** Giải thích do AI viết (tầng 2) — null nếu chưa chạy. */
  explanation?: string | null;
  explanationGeneratedAt?: string | null;
  explanationModel?: string | null;
  /** Kết luận của người xem xét — null = chưa ai xem. */
  verdict?: DuplicateVerdict | null;
  verdictNote?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
}

export interface ReviewDuplicatePayload {
  verdict: DuplicateVerdict;
  note?: string;
}

export const DUPLICATE_VERDICTS: DuplicateVerdict[] = [
  "NOT_DUPLICATE",
  "NEEDS_REVISION",
  "DUPLICATE",
];
