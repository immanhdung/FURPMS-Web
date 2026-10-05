export interface ProgressReportItem {
  id: number;
  activityId: number;
  activityName: string;
  completionRate: number;
  completionStatus: string;
  evidenceDescription?: string | null;
  notes?: string | null;
}

export interface ProgressReport {
  id: string;
  contractId: string;
  reportRound?: number | null;
  /** Tên đợt Staff đặt (vd "Giữa kỳ"); null → hiện "Kỳ {số}". */
  roundName?: string | null;
  /** Link báo cáo PI dán thay cho upload (file quá lớn). */
  reportFileUrl?: string | null;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
  completedContent?: string | null;
  pendingContent?: string | null;
  overallCompletionPct?: number | null;
  expenditureToDate?: number | null;
  nextPeriodPlan?: string | null;
  piRecommendations?: string | null;
  status?: string | null;
  dueDate?: string | null;
  /** Số ngày còn lại do MÁY CHỦ tính; âm = quá hạn. */
  daysLeft?: number | null;
  scheduledMeetingAt?: string | null;
  meetingLink?: string | null;
  /** Bảng tiến độ theo hoạt động (BM06) — CHỈ có ở endpoint chi tiết, không có ở danh sách. */
  items?: ProgressReportItem[] | null;
  evaluationResult?: string | null;
  evaluationComments?: string | null;
  submittedAt?: string | null;
}

/**
 * The backend's CreateProgressReportRequest bundles the reporting period together with all of
 * the PI-authored content in one DTO, with no separate "edit content" endpoint — so the PI fills
 * this out directly when creating the report, then calls POST /{id}/submit to finalize it.
 */
export interface CreateProgressReportPayload {
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  completedContent?: string;
  pendingContent?: string;
  overallCompletionPct?: number;
  expenditureToDate?: number;
  nextPeriodPlan?: string;
  piRecommendations?: string;
  /** Bảng tiến độ theo từng hoạt động (BM06) — gửi lên là thay toàn bộ bảng cũ. */
  items?: {
    activityId: number;
    completionRate: number;
    completionStatus: string;
    evidenceDescription?: string;
    notes?: string;
  }[];
}

export interface ScheduleProgressReportPayload {
  dueDate?: string;
  scheduledMeetingAt?: string;
  meetingLink?: string;
  /** Staff đặt/sửa tên đợt. */
  roundName?: string;
}

export interface EvaluateProgressReportPayload {
  evaluationResult?: string;
  evaluationComments?: string;
}
