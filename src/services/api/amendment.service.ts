import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Amendment, AmendmentCategory, CreateAmendmentPayload } from "@/types/amendment";

export const amendmentService = {
  listByContract: (contractId: string) =>
    axiosClient.get<ApiResponse<Amendment[]>>(`/contracts/${contractId}/amendments`).then((res) => res.data.data),

  create: (contractId: string, payload: CreateAmendmentPayload) =>
    axiosClient
      .post<ApiResponse<Amendment>>(`/contracts/${contractId}/amendments`, payload)
      .then((res) => res.data.data),

  approve: (id: string, reviewerComments?: string) =>
    axiosClient
      .post<ApiResponse<Amendment>>(`/amendments/${id}/approve`, { reviewerComments })
      .then((res) => res.data.data),

  reject: (id: string, reviewerComments?: string) =>
    axiosClient
      .post<ApiResponse<Amendment>>(`/amendments/${id}/reject`, { reviewerComments })
      .then((res) => res.data.data),

  listCategories: () =>
    axiosClient
      .get<ApiResponse<AmendmentCategory[]>>("/amendment-categories", { params: { activeOnly: true } })
      .then((res) => res.data.data),

  /**
   * Xuất **phụ lục hợp đồng** ra Word để ký ngoài.
   * BM05 Điều 6.1: sửa đổi phải "lập thành văn bản phụ lục có đầy đủ chữ ký của các bên" —
   * KHÔNG sinh lại hợp đồng gốc. Máy chủ trả 409 nếu đề nghị chưa được duyệt.
   */
  exportWord: (id: string) =>
    axiosClient.get<Blob>(`/amendments/${id}/export-word`, { responseType: "blob" }).then((res) => res.data),
};
