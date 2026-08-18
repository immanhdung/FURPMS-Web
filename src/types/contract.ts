export interface Contract {
  id: string;
  proposalId: string;
  /** Tên đề tài do BE trả kèm — dùng thẳng, đừng tra ngược từ danh sách đề cương. */
  proposalTitle?: string | null;
  piName?: string | null;
  researchTypeId?: number;
  researchTypeCode?: string | null;
  researchTypeName?: string | null;
  cycleId?: number;
  cycleCode?: string | null;
  trackId?: number;
  trackCode?: string | null;
  trackName?: string | null;
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
  /** Trạng thái đề tài: nghiệm thu Đạt = COMPLETED, tách biệt với thanh lý hợp đồng. */
  projectStatus?: string | null;
  terminatedAt?: string | null;
  terminatedReason?: string | null;
  createdAt?: string | null;
}

export interface TerminateContractPayload {
  reason: string;
}

export type UpdateContractPayload = Omit<CreateContractPayload, "proposalId">;

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
