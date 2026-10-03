import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  AddCouncilMemberPayload,
  CouncilMember,
  ProjectInvitationStatus,
  RespondMembershipPayload,
} from "@/types/council-member";

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

  /**
   * Staff/Admin ghi nhận trả lời thư mời THAY thành viên (họ đồng ý/từ chối ngoài hệ thống).
   *
   * Trước đây chỉ có nhánh XÁC NHẬN dùng endpoint riêng, còn nút "Đánh dấu từ chối" gọi nhầm sang
   * `respond` — endpoint dành cho CHÍNH thành viên — nên chuyên viên luôn nhận 403 "Bạn chỉ trả
   * lời được thư mời gửi cho chính mình".
   */
  respondOnBehalf: (memberId: string, payload: RespondMembershipPayload) =>
    axiosClient
      .post<ApiResponse<CouncilMember>>(`/council-members/${memberId}/respond-on-behalf`, payload)
      .then((res) => res.data.data),

  /** Trạng thái nhận lời của từng thành viên với MỘT đề tài (03/10). */
  projectInvitations: (councilId: string, projectId: string) =>
    axiosClient
      .get<ApiResponse<ProjectInvitationStatus[]>>(`/councils/${councilId}/projects/${projectId}/invitations`)
      .then((res) => res.data.data),

  /** Thành viên trả lời riêng một đề tài. */
  respondProject: (memberId: string, projectId: string, payload: RespondMembershipPayload) =>
    axiosClient
      .patch<ApiResponse<ProjectInvitationStatus>>(
        `/council-members/${memberId}/projects/${projectId}/respond`,
        payload
      )
      .then((res) => res.data.data),

  /** Phòng QLKH ghi nhận hộ trả lời cho một đề tài. */
  respondProjectOnBehalf: (memberId: string, projectId: string, payload: RespondMembershipPayload) =>
    axiosClient
      .post<ApiResponse<ProjectInvitationStatus>>(
        `/council-members/${memberId}/projects/${projectId}/respond-on-behalf`,
        payload
      )
      .then((res) => res.data.data),

  remove: (memberId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/council-members/${memberId}`).then((res) => res.data),
};
