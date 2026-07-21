import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateSettlementPayload, SignSettlementPayload, Settlement } from "@/types/settlement";

export const settlementService = {
  get: (contractId: string) =>
    axiosClient
      .get<ApiResponse<Settlement | null>>(`/contracts/${contractId}/settlement`)
      .then((res) => res.data.data),

  create: (contractId: string, payload: CreateSettlementPayload) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/contracts/${contractId}/settlement`, payload)
      .then((res) => res.data.data),

  sign: (id: string, payload: SignSettlementPayload) =>
    axiosClient.post<ApiResponse<Settlement>>(`/settlements/${id}/sign`, payload).then((res) => res.data.data),

  markAccountingCleared: (id: string) =>
    axiosClient.post<ApiResponse<Settlement>>(`/settlements/${id}/accounting-cleared`).then((res) => res.data.data),

  markAssetsCleared: (id: string) =>
    axiosClient.post<ApiResponse<Settlement>>(`/settlements/${id}/assets-cleared`).then((res) => res.data.data),
};
