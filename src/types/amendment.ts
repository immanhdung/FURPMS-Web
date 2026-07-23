/** Điều chỉnh hợp đồng — PI đề nghị thay đổi, Staff duyệt/từ chối. */
export interface Amendment {
  id: string;
  contractId: string;
  categoryId: number;
  categoryName?: string | null;
  changeDescription: string;
  justification: string;
  status: string;
  requestedAt: string;
  oldValue?: string | null;
  newValue?: string | null;
  /** Chỉ có ở API chi tiết. */
  changePercentage?: number | null;
  requiresRectorApproval?: boolean;
  reviewerComments?: string | null;
  reviewedAt?: string | null;
}

export interface CreateAmendmentPayload {
  categoryId: number;
  changeDescription: string;
  justification: string;
  changePercentage?: number;
  oldValue?: string;
  newValue?: string;
  requiresRectorApproval: boolean;
}

export interface AmendmentCategory {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export const AMENDMENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
