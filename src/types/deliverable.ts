/**
 * Sản phẩm phải nộp của đề tài (`project_deliverables`).
 * Khai lúc nộp đề cương ("sản phẩm dự kiến") → khi tạo hợp đồng thì được gắn vào hợp đồng đó.
 * Rule #3: sản phẩm nghiệm thu ĐẠT → BE bật cờ đủ điều kiện giải ngân, Staff vẫn phải chi tay.
 */
export interface Deliverable {
  id: number;
  projectId: string;
  contractId?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  productName: string;
  description?: string | null;
  dueDate?: string | null;
  acceptanceStatus?: string | null;
  isCompleted: boolean;
  submittedAt?: string | null;
  fileUrl?: string | null;
  qualityAssessment?: string | null;
}

/** PI nộp sản phẩm. */
export interface SubmitDeliverablePayload {
  fileUrl: string;
  description?: string;
}

/** Staff nghiệm thu. */
export interface EvaluateDeliverablePayload {
  acceptanceStatus: string;
  qualityAssessment?: string;
}

export const ACCEPTANCE_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;
