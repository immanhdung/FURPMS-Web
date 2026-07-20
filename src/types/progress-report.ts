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

/** Staff only sets the reporting period when creating a round — see CreateProgressReportPayload note below. */
export interface CreateProgressReportPayload {
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
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
