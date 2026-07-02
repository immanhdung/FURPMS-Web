import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AddCouncilMemberPayload, CouncilMember, RespondMembershipPayload } from "@/types/council-member";

export const councilMemberService = {
  list: (councilId: string) =>
    axiosClient.get<ApiResponse<CouncilMember[]>>(`/councils/${councilId}/members`).then((res) => res.data.data),

  add: (councilId: string, payload: AddCouncilMemberPayload) =>
    axiosClient
      .post<ApiResponse<CouncilMember>>(`/councils/${councilId}/members`, payload)
      .then((res) => res.data.data),

  respond: (memberId: string, payload: RespondMembershipPayload) =>
    axiosClient
      .patch<ApiResponse<CouncilMember>>(`/council-members/${memberId}/respond`, payload)
      .then((res) => res.data.data),

  remove: (memberId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/council-members/${memberId}`).then((res) => res.data),
};
