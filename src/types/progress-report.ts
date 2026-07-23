export interface ProgressReport {
  id: string;
  contractId: string;
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
  scheduledMeetingAt?: string | null;
  meetingLink?: string | null;
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
}

export interface ScheduleProgressReportPayload {
  dueDate?: string;
  scheduledMeetingAt?: string;
  meetingLink?: string;
}

export interface EvaluateProgressReportPayload {
  evaluationResult?: string;
  evaluationComments?: string;
}
