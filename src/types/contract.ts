export interface Contract {
  id: string;
  proposalId: string;
  piName?: string | null;
  contractNumber?: string | null;
  scopeTitle?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  /** Hạn GỐC lúc ký — khác endDate nghĩa là đã gia hạn. */
  originalEndDate?: string | null;
  maxExtensionMonths?: number | null;
  sideARepresentative?: string | null;
  econtractUrl?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface CreateContractPayload {
  proposalId: string;
  contractNumber?: string;
  scopeTitle?: string;
  startDate: string;
  endDate: string;
  maxExtensionMonths: number;
  sideARepresentative?: string;
  econtractUrl?: string;
}
