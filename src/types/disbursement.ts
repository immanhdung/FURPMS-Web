/** Field names beyond the confirmed request DTO are unconfirmed guesses — see statuses.ts note. */
export interface Disbursement {
  id: string;
  contractId: string;
  installmentNumber?: number | null;
  plannedAmount?: number | null;
  actualAmount?: number | null;
  bankReference?: string | null;
  notes?: string | null;
  status?: string | null;
  dueDate?: string | null;
  confirmedAt?: string | null;
}

export interface ConfirmDisbursementPayload {
  actualAmount: number;
  bankReference?: string;
  notes?: string;
}
