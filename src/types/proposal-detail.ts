import type { ProposalMember } from "@/types/proposal-member";

/** Một dòng dự toán BE trả về — khớp `ProposalBudgetItemDto`. */
export interface ProposalBudgetItem {
  id?: number;
  /** TÊN hạng mục (để hiển thị). */
  category: string;
  /** MÃ hạng mục — dùng khi nạp lại form, vì tên đổi theo quy định còn mã thì giữ. */
  categoryCode?: string | null;
  amount: number;
  note?: string | null;
}

export interface ProposalDetail {
  id: string;
  /** Đề tài mà đề cương này thuộc về — cần để mở hồ sơ quyết định, dòng thời gian, ngân sách của đề tài. */
  projectId?: string | null;
  cycleId?: number | null;
  orderId?: number | null;
  trackId?: string | null;
  titleVI?: string | null;
  titleEN?: string | null;
  researchType: number;
  durationMonths: number;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  abstractEN?: string | null;
  urgency?: string | null;
  novelty?: string | null;
  applicationPotential?: string | null;
  transferPotential?: string | null;
  facilities?: string | null;
  fundingMethod?: string | null;
  /** Tổng dự toán kinh phí; trần theo loại đề tài (QĐ543 Điều 14). */
  totalBudget?: number | null;
  /** Dự toán theo hạng mục (QĐ543 Điều 15) — BE trả kèm chi tiết đề cương. */
  budgetItems?: ProposalBudgetItem[] | null;
  members?: ProposalMember[] | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface ProposalPayload {
  cycleId?: number;
  orderId?: number;
  trackId?: string;
  titleVI?: string;
  titleEN?: string;
  researchType: number;
  durationMonths: number;
  objectives?: string;
  methodology?: string;
  expectedOutput?: string;
  abstractEN?: string;
  urgency?: string;
  novelty?: string;
  applicationPotential?: string;
  transferPotential?: string;
  facilities?: string;
  fundingMethod?: string;
  /** Tổng dự toán khi chủ nhiệm chưa tách theo hạng mục — BE bỏ qua nếu có `budgetItems`. */
  totalBudget?: number;
  /** Dự toán theo 06 hạng mục QĐ543 Điều 15; `category` gửi **mã** hạng mục. */
  budgetItems?: { category: string; amount: number; note?: string }[];
  members?: ProposalMember[];
}
