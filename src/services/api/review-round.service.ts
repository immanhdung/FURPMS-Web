import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CloseRoundPayload, CreateReviewRoundPayload, ReviewRound } from "@/types/review-round";

export const reviewRoundService = {
  list: (proposalId: string) =>
    axiosClient.get<ApiResponse<ReviewRound[]>>(`/proposals/${proposalId}/rounds`).then((res) => res.data.data),

  create: (proposalId: string, payload: CreateReviewRoundPayload) =>
    axiosClient
      .post<ApiResponse<ReviewRound>>(`/proposals/${proposalId}/rounds`, payload)
      .then((res) => res.data.data),

  open: (roundId: string) =>
    axiosClient.post<ApiResponse<ReviewRound>>(`/rounds/${roundId}/open`).then((res) => res.data.data),

  close: (roundId: string, payload: CloseRoundPayload) =>
    axiosClient.post<ApiResponse<ReviewRound>>(`/rounds/${roundId}/close`, payload).then((res) => res.data.data),
};
