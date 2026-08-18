/**
 * Hồ sơ hội đồng NGHIỆM THU đọc trước khi chấm — khớp `AcceptanceDossierDto` của BE.
 * Nguồn: `Process_Spec_v2` §Giai đoạn 8 (báo cáo tiến độ · sản phẩm · báo cáo tổng kết).
 */
import type { DossierFile } from "@/components/shared/DossierDetailSheet";

export interface DossierProgressReport {
  reportRound: number;
  roundName?: string | null;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  overallCompletionPct: number;
  status: string;
  /** Kết quả Staff đánh giá: PASS / CONDITIONAL / FAIL. */
  evaluationResult?: string | null;
  evaluationComments?: string | null;
  submittedAt?: string | null;
}

export interface DossierDeliverable {
  id: number;
  productName: string;
  description?: string | null;
  acceptanceStatus?: string | null;
  qualityAssessment?: string | null;
  submittedAt?: string | null;
  dueDate?: string | null;
  hasFile: boolean;
}

export interface DossierFinalReport {
  status: string;
  submittedAt?: string | null;
  deadline?: string | null;
  hasFile: boolean;
  /**
   * File báo cáo tổng kết (BM09) PI đã nộp — **máy chủ vẫn luôn trả về**, chỉ là kiểu ở FE chép
   * tay nên thiếu trường này (đúng cái bẫy ghi ở `AGENTS.md` §3.2). Hậu quả: tab Nghiệm thu chỉ
   * hiện được "Đã tiếp nhận" mà không mở được file — lỗi Dũng báo 18/08.
   */
  files?: DossierFile[] | null;
}

export interface AcceptanceDossier {
  contractNumber?: string | null;
  contractStatus?: string | null;
  progressReports: DossierProgressReport[];
  deliverables: DossierDeliverable[];
  finalReport?: DossierFinalReport | null;
  deliverablesPassed: number;
  deliverablesTotal: number;
}
