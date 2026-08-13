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

  remove: (memberId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/council-members/${memberId}`).then((res) => res.data),
};
