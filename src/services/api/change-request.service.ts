import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  ChangeRequest,
  CreateChangeRequestPayload,
  ReviewChangeRequestPayload,
} from "@/types/change-request";

export const changeRequestService = {
  /** GET /api/proposals/{proposalId}/change-requests */
  listByProposal: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<ChangeRequest[]>>(`/proposals/${proposalId}/change-requests`)
      .then((res) => res.data.data),

  /** GET /api/change-requests/pending — Staff: list all pending change requests */
  listPending: () =>
    axiosClient
      .get<ApiResponse<ChangeRequest[]>>("/change-requests/pending")
      .then((res) => res.data.data),

  /** POST /api/proposals/{proposalId}/change-requests — PI creates */
  create: (proposalId: string, payload: CreateChangeRequestPayload) =>
    axiosClient
      .post<ApiResponse<ChangeRequest>>(`/proposals/${proposalId}/change-requests`, payload)
      .then((res) => res.data.data),

  /** PATCH /api/change-requests/{id}/review — Staff approves or rejects */
  review: (id: string, payload: ReviewChangeRequestPayload) =>
    axiosClient
      .patch<ApiResponse<ChangeRequest>>(`/change-requests/${id}/review`, payload)
      .then((res) => res.data.data),
};
