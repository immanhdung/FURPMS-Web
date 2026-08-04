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

  /**
   * Sản phẩm minh chứng của đợt (rule #15: hệ thống không quản tiền, chỉ theo dõi
   * mốc + minh chứng). BE trả kèm tên/trạng thái nên FE không phải tự ghép.
   */
  deliverableId?: number | null;
  deliverableName?: string | null;
  /** PENDING / PASSED / FAILED — null khi đợt chưa gắn sản phẩm. */
  deliverableAcceptanceStatus?: string | null;
  deliverableSubmittedAt?: string | null;
  /** Có gắn sản phẩm nhưng sản phẩm chưa nghiệm thu Đạt ⇒ BE chặn đánh dấu giải ngân. */
  isBlockedByDeliverable?: boolean;
}

/** Gắn sản phẩm minh chứng cho đợt; `null` = gỡ. */
export interface LinkDeliverablePayload {
  deliverableId: number | null;
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
