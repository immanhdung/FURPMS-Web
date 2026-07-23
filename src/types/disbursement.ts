/**
 * Đợt giải ngân của hợp đồng.
 * Rule #6: WHOLE → tối thiểu 3 đợt (đầu/giữa/cuối); PARTIAL → 1 đợt cho mỗi mốc nghiệm thu sản phẩm.
 */
export interface Disbursement {
  id: number;
  contractId: string;
  roundNumber: number;
  /** Tỷ lệ % của đợt này trên tổng giá trị hợp đồng. */
  percentage: number;
  plannedAmount: number;
  /** Số tiền chi thực tế — chỉ có sau khi Staff xác nhận. */
  actualAmount?: number | null;
  conditionDescription: string;
  /** Có giá trị = điều kiện giải ngân đã đạt (sản phẩm nghiệm thu xong), CHỜ Staff chi tiền. */
  conditionMetAt?: string | null;
  disbursedAt?: string | null;
  bankReference?: string | null;
  status: string;
  notes?: string | null;
  deliverableId?: number | null;
}

/** Rule tuần 10: hệ thống không quản tiền — Staff chỉ "đánh dấu đã giải ngân" (kèm ghi chú/minh chứng). */
export interface ConfirmDisbursementPayload {
  actualAmount?: number;
  bankReference?: string;
  notes?: string;
}

export const DISBURSEMENT_STATUS = {
  PENDING: "PENDING",
  DISBURSED: "DISBURSED",
} as const;
