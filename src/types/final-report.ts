/** Báo cáo tổng kết đề tài — nộp cuối hợp đồng, Staff duyệt rồi lưu trữ. */
export interface FinalReport {
  id: string;
  projectId: string;
  status: string;
  reportFileUrl?: string | null;
  summaryFileUrl?: string | null;
  language: string;
  deadline?: string | null;
  submittedAt?: string | null;
  revisionNotes?: string | null;
  revisionRequestedAt?: string | null;
  finalSubmittedAt?: string | null;
  archivalDeadline?: string | null;
  archivedAt?: string | null;
}

export interface SubmitFinalReportPayload {
  reportFileUrl: string;
  summaryFileUrl?: string;
  language: string;
}

export const FINAL_REPORT_STATUS = {
  SUBMITTED: "SUBMITTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
  ACCEPTED: "ACCEPTED",
  ARCHIVED: "ARCHIVED",
} as const;
