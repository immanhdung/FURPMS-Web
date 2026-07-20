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
};
