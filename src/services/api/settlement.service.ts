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
    axiosClient
      .post<ApiResponse<Settlement>>(`/settlements/${id}/sign`, { sideASigneeId })
      .then((res) => res.data.data),

  markAccountingCleared: (id: number, clearedDate?: string) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/settlements/${id}/accounting-cleared`, { clearedDate })
      .then((res) => res.data.data),

  markAssetsCleared: (id: number, clearedDate?: string) =>
    axiosClient
      .post<ApiResponse<Settlement>>(`/settlements/${id}/assets-cleared`, { clearedDate })
      .then((res) => res.data.data),

  /** Sửa số liệu khi CHƯA ký biên bản thanh lý. */
  update: (id: number, payload: CreateSettlementPayload) =>
    axiosClient.put<ApiResponse<Settlement>>(`/settlements/${id}`, payload).then((res) => res.data.data),

  /** Xoá hồ sơ CHƯA ký để lập lại — lý do bắt buộc. */
  delete: (id: number, reason: string) => axiosClient.delete(`/settlements/${id}`, { params: { reason } }),

  /** Huỷ chữ ký BM13 (ký nhầm) — lý do bắt buộc. */
  unsign: (id: number, reason: string) =>
    axiosClient.post<ApiResponse<Settlement>>(`/settlements/${id}/unsign`, { reason }).then((res) => res.data.data),
};
