/** Field names beyond the confirmed request DTOs are unconfirmed guesses — see statuses.ts note. */
export interface Settlement {
  id: string;
  contractId: string;
  totalContractedAmount?: number | null;
  totalDisbursedAmount?: number | null;
  totalReturnedAmount?: number | null;
  productsSubmittedSummary?: string | null;
  settlementDeadline?: string | null;
  notes?: string | null;
  status?: string | null;
  sideASigneeId?: string | null;
  signedAt?: string | null;
  accountingClearedAt?: string | null;
  assetsClearedAt?: string | null;
}

export interface CreateSettlementPayload {
  totalContractedAmount: number;
  totalDisbursedAmount: number;
  totalReturnedAmount: number;
  productsSubmittedSummary?: string;
  settlementDeadline?: string;
  notes?: string;
}

export interface SignSettlementPayload {
  sideASigneeId: string;
}
