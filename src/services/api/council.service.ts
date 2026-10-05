import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  Council,
  CouncilListItem,
  CouncilQuery,
  CreateCouncilPayload,
  SendInvitationsPayload,
  UpdateCouncilPayload,
} from "@/types/council";

export const councilService = {
  create: (payload: CreateCouncilPayload) =>
    axiosClient.post<ApiResponse<Council>>("/councils", payload).then((res) => res.data.data),

  sendInvitations: (councilId: string, payload: SendInvitationsPayload) =>
    axiosClient
      .post<ApiResponse<null>>(`/councils/${councilId}/send-invitations`, payload)
      .then((res) => res.data),

  list: (query: CouncilQuery = {}) =>
    axiosClient
      .get<ApiResponse<CouncilListItem[]>>("/councils", { params: query })
      .then((res) => res.data.data),

  getById: (councilId: string) =>
    axiosClient
      .get<ApiResponse<CouncilListItem>>(`/councils/${councilId}`)
      .then((res) => res.data.data),

  update: (councilId: string, payload: UpdateCouncilPayload) =>
    axiosClient
      .put<ApiResponse<CouncilListItem>>(`/councils/${councilId}`, payload)
      .then((res) => res.data.data),

  /** Đổi vai trò thành viên — trước đây gán sai vai chỉ còn cách xoá rồi thêm lại, mất dấu vết đã mời. */
  updateMemberRole: (memberId: string, memberRole: string) =>
    axiosClient
      .put<ApiResponse<unknown>>(`/council-members/${memberId}`, { memberRole })
      .then((res) => res.data.data),

  removeMember: (memberId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/council-members/${memberId}`).then((res) => res.data),

  remove: (councilId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/councils/${councilId}`).then((res) => res.data),
};
