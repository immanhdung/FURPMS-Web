import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalListParams, ProposalSummary } from "@/types/proposal-summary";

export const proposalService = {
  list: (params?: ProposalListParams) =>
    axiosClient.get<ApiResponse<ProposalSummary[]>>("/proposals", { params }).then((res) => res.data.data),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<ProposalSummary>>(`/proposals/${id}`).then((res) => res.data.data),
};
