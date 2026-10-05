export interface CouncilMember {
  id: string;
  councilId: string;
  userId: string;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  memberRole?: string | null;
  isExternal: boolean;
  status?: string | null;
  invitationSentAt?: string | null;
  confirmedAt?: string | null;
  declinedAt?: string | null;
}

export interface AddCouncilMemberPayload {
  userId: string;
  memberRole?: string;
  isExternal: boolean;
  /**
   * Đồng ý gán người **không khai đúng lĩnh vực** của đề tài (QĐ543 Điều 8.2).
   * Thiếu cờ này thì BE trả 400; có cờ mà thiếu `expertiseNote` cũng 400.
   */
  acceptWithoutExpertise?: boolean;
  /** Lý do gán người ngoài lĩnh vực — ghi vào sổ quyết định của đề tài. */
  expertiseNote?: string;
}

export interface RespondMembershipPayload {
  accept: boolean;
  declineReason?: string;
}
