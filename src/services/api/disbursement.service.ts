import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ConfirmDisbursementPayload, Disbursement } from "@/types/disbursement";

export const disbursementService = {
  list: (contractId: string) =>
    axiosClient
      .get<ApiResponse<Disbursement[]>>(`/contracts/${contractId}/disbursements`)
      .then((res) => res.data.data),

  generate: (contractId: string) =>
    axiosClient
      .post<ApiResponse<Disbursement[]>>(`/contracts/${contractId}/disbursements/generate`)
      .then((res) => res.data.data),

  confirm: (id: string, payload: ConfirmDisbursementPayload) =>
    axiosClient
      .post<ApiResponse<Disbursement>>(`/disbursements/${id}/confirm`, payload)
      .then((res) => res.data.data),
};
