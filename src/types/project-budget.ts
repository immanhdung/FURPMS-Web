/**
 * Bức tranh kinh phí của một đề tài — khớp `ProjectBudgetOverviewResponse` của BE.
 * Gom 4 nguồn đang nằm rời: dự toán đề cương (Điều 15) · trần loại đề tài (Điều 14) ·
 * hợp đồng đã ký · lịch giải ngân.
 */

/** Mã 06 hạng mục QĐ543 Điều 15 — cố định, dùng làm khoá i18n `budget.heading.*`. */
export type BudgetHeadingCode =
  | "LABOR"
  | "EQUIPMENT"
  | "EXTERNAL_SERVICE"
  | "CONFERENCE"
  | "OFFICE"
  | "INCIDENTAL_IP";

export interface BudgetHeading {
  code: BudgetHeadingCode;
  amount: number;
  percentage: number;
}

export interface BudgetItemBreakdown {
  categoryName: string;
  amount: number;
  sourceKhoan: number;
  sourceNgoaiKhoan: number;
  sourceNsnn: number;
  sourceOther: number;
  note?: string | null;
}

export interface ContractBrief {
  id: string;
  contractNumber?: string | null;
  totalAmount: number;
  status: string;
  signedAt?: string | null;
}

export interface DisbursementBrief {
  id: number;
  roundNumber: number;
  percentage: number;
  plannedAmount: number;
  actualAmount?: number | null;
  status: string;
  conditionDescription?: string | null;
  disbursedAt?: string | null;
  isBlockedByDeliverable: boolean;
}

export interface SettlementBrief {
  totalContractedAmount: number;
  totalDisbursedAmount: number;
  totalReturnedAmount: number;
  settlementDeadline?: string | null;
  settlementSignedAt?: string | null;
}

export interface ProjectBudgetOverview {
  projectId: string;
  projectCode?: string | null;
  titleVi?: string | null;
  researchTypeName?: string | null;
  fundingMethod?: string | null;
  /** Trần theo loại đề tài. `null` = loại này KHÔNG đặt trần (khác với trần bằng 0). */
  fundingCap?: number | null;
  approvedTotal: number;
  approvedByHeading: BudgetHeading[];
  approvedItems: BudgetItemBreakdown[];
  contractedTotal: number;
  contracts: ContractBrief[];
  plannedTotal: number;
  markedDisbursedTotal: number;
  /** Có đợt đã đánh dấu chi nhưng chưa có số thực chi ⇒ tổng đang là TẠM TÍNH theo kế hoạch. */
  hasUnreportedActuals: boolean;
  remainingTotal: number;
  tranches: DisbursementBrief[];
  nextTranche?: DisbursementBrief | null;
  settlement?: SettlementBrief | null;
  capExceeded: boolean;
}
