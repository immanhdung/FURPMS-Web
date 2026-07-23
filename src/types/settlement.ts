/** Quyết toán hợp đồng — chốt sổ tiền + tài sản khi đề tài kết thúc. */
export interface Settlement {
  id: number;
  contractId: string;
  totalContractedAmount: number;
  totalDisbursedAmount: number;
  totalReturnedAmount: number;
  productsSubmittedSummary?: string | null;
  accountingClearedAt?: string | null;
  assetsClearedAt?: string | null;
  settlementSignedAt?: string | null;
  sideASigneeId?: string | null;
  sideASigneeName?: string | null;
  settlementDeadline?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateSettlementPayload {
  totalContractedAmount: number;
  totalDisbursedAmount: number;
  totalReturnedAmount: number;
  productsSubmittedSummary?: string;
  settlementDeadline?: string;
  notes?: string;
}
