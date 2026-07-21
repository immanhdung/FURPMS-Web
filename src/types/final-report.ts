/** Field names beyond the confirmed request DTOs are unconfirmed guesses — see statuses.ts note. */
export interface FinalReport {
  id: string;
  contractId: string;
  reportFileUrl?: string | null;
  summaryFileUrl?: string | null;
  language?: string | null;
  status?: string | null;
  revisionNotes?: string | null;
  submittedAt?: string | null;
  acceptedAt?: string | null;
  archivedAt?: string | null;
}

export interface SubmitFinalReportPayload {
  reportFileUrl?: string;
  summaryFileUrl?: string;
  language?: string;
}

export interface RequestFinalReportRevisionPayload {
  revisionNotes?: string;
}
