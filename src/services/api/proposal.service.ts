import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalListParams, ProposalSummary } from "@/types/proposal-summary";
import type { ProposalDetail, ProposalPayload } from "@/types/proposal-detail";

export const proposalService = {
  list: (params?: ProposalListParams) =>
    axiosClient.get<ApiResponse<ProposalSummary[]>>("/proposals", { params }).then((res) => res.data.data),

  mine: () => axiosClient.get<ApiResponse<ProposalSummary[]>>("/proposals/my").then((res) => res.data.data),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<ProposalDetail>>(`/proposals/${id}`).then((res) => res.data.data),

  create: (payload: ProposalPayload) =>
    axiosClient.post<ApiResponse<ProposalDetail>>("/proposals", payload).then((res) => res.data.data),

  update: (id: string, payload: ProposalPayload) =>
    axiosClient.put<ApiResponse<ProposalDetail>>(`/proposals/${id}`, payload).then((res) => res.data.data),

  submit: (id: string, confirmCv: boolean) =>
    axiosClient
      .post<ApiResponse<ProposalDetail>>(`/proposals/${id}/submit`, null, { params: { confirmCv } })
      .then((res) => res.data.data),

  withdraw: (id: string) =>
    axiosClient.patch<ApiResponse<ProposalDetail>>(`/proposals/${id}/withdraw`).then((res) => res.data.data),
};
