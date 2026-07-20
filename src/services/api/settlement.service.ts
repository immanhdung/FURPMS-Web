import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateSettlementPayload, Settlement } from "@/types/settlement";

export const settlementService = {
  /** Trả `null` khi chưa lập quyết toán. */
  getByContract: (contractId: string) =>
    axiosClient.get<ApiResponse<Settlement | null>>(`/contracts/${contractId}/settlement`).then((res) => res.data.data),

  create: (contractId: string, payload: CreateSettlementPayload) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/contracts/${contractId}/settlement`, payload)
      .then((res) => res.data.data),

  sign: (id: number, sideASigneeId: string) =>
    axiosClient.post<ApiResponse<Settlement>>(`/settlements/${id}/sign`, { sideASigneeId }).then((res) => res.data.data),

  markAccountingCleared: (id: number, clearedDate: string) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/settlements/${id}/accounting-cleared`, { clearedDate })
      .then((res) => res.data.data),

  markAssetsCleared: (id: number, clearedDate: string) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/settlements/${id}/assets-cleared`, { clearedDate })
      .then((res) => res.data.data),
};
