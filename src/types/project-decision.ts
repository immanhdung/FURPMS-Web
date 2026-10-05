/** Hồ sơ quyết định của đề tài — khớp `ProjectDecisionDossierResponse` của BE. */

/** Chặng của quyết định — dùng để gom nhóm, không phải danh sách phẳng. */
export type DecisionStage =
  | "PROPOSAL"
  | "REVIEW"
  | "CONTRACT"
  | "EXECUTION"
  | "CLOSING"
  /** Gia hạn — xảy ra ở bất kỳ chặng nào nên đứng riêng. */
  | "SCHEDULE"
  | "OTHER";

export interface DecisionAttachment {
  id: string;
  fileName?: string | null;
  fileUrl?: string | null;
  documentType?: string | null;
  uploadedAt?: string | null;
}

export interface ProjectDecision {
  id: string;
  decisionType: string;
  stage: DecisionStage;
  result?: string | null;
  summary: string;
  reason?: string | null;
  /** Số hiệu biểu mẫu/văn bản (BM04, BM12, BM13…). */
  documentNo?: string | null;
  /** Bảng gốc + khoá — để dựng link "Xem bản gốc". */
  sourceEntityType: string;
  sourceEntityId: string;
  decidedBy?: string | null;
  decidedByName?: string | null;
  /** Chức danh **tại thời điểm chốt**, không phải vai hiện tại của người đó. */
  decidedByRole?: string | null;
  decidedAt: string;
  attachments: DecisionAttachment[];
}

export interface ProjectDecisionDossier {
  projectId: string;
  projectCode?: string | null;
  titleVi?: string | null;
  totalCount: number;
  decisions: ProjectDecision[];
}

/** Thứ tự hiển thị các chặng — theo vòng đời đề tài. */
export const DECISION_STAGE_ORDER: DecisionStage[] = [
  "PROPOSAL",
  "REVIEW",
  "CONTRACT",
  "EXECUTION",
  "CLOSING",
  "SCHEDULE",
  "OTHER",
];
