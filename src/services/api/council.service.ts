import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Council, CreateCouncilPayload, SendInvitationsPayload } from "@/types/council";

export const councilService = {
  create: (payload: CreateCouncilPayload) =>
    axiosClient.post<ApiResponse<Council>>("/councils", payload).then((res) => res.data.data),

  sendInvitations: (councilId: string, payload: SendInvitationsPayload) =>
    axiosClient
      .post<ApiResponse<null>>(`/councils/${councilId}/send-invitations`, payload)
      .then((res) => res.data),
};
