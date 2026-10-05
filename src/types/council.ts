export interface Council {
  id: string;
  proposalId: string;
  roundId?: string | null;
  councilType?: string | null;
  establishmentDecisionNo?: string | null;
  establishedAt?: string | null;
  meetingDeadline?: string | null;
  minMembersRequired: number;
  maxMembersAllowed: number;
  status?: string | null;
  createdAt: string;
}

export interface CreateCouncilPayload {
  proposalId: string;
  roundId: string;
  councilType?: string;
  establishmentDecisionNo?: string;
  establishedAt?: string;
  meetingDeadline?: string;
  minMembersRequired: number;
  maxMembersAllowed: number;
}

export interface SendInvitationsPayload {
  confirmDeadline?: string;
}

/**
 * Một hội đồng nhìn từ màn quản lý của Phòng QLKH.
 *
 * `missingForInvitation` là thứ đáng giá nhất ở đây: máy chủ trả sẵn **danh sách việc còn thiếu**
 * để gửi được thư mời, nên chuyên viên nhìn bảng là biết phải làm gì — không phải mở từng hội
 * đồng ra đếm thành viên rồi kiểm lịch họp.
 */
export interface CouncilListItem {
  id: string;
  councilType: string;
  status: string;
  establishmentDecisionNo: string | null;
  establishedAt: string | null;
  meetingDeadline: string | null;

  roundId: string | null;
  roundType: string | null;
  roundName: string | null;
  cycleName: string | null;
  trackName: string | null;

  memberCount: number;
  minMembersRequired: number;
  hasChair: boolean;
  hasSecretary: boolean;
  chairName: string | null;
  secretaryName: string | null;

  invitedCount: number;
  confirmedCount: number;
  declinedCount: number;

  projectCount: number;
  meetingCount: number;
  nextMeetingAt: string | null;
  nextMeetingLocation: string | null;
  finalizedProjectCount: number;

  /** Rỗng = sẵn sàng gửi thư mời. */
  missingForInvitation: string[];
  invitationsSent: boolean;
}

export interface CouncilQuery {
  search?: string;
  status?: string;
  councilType?: string;
  cycleId?: number;
  /** Chỉ lấy hội đồng chưa gửi được thư mời — việc tồn đọng của chuyên viên. */
  notReadyOnly?: boolean;
}

export interface UpdateCouncilPayload {
  establishmentDecisionNo?: string;
  establishedAt?: string;
  meetingDeadline?: string;
  minMembersRequired?: number;
  maxMembersAllowed?: number;
  status?: string;
}

/** Vai trò trong hội đồng — phải khớp CouncilMemberRole bên máy chủ. */
export const COUNCIL_MEMBER_ROLES = ["Chair", "Secretary", "Opponent", "Member"] as const;
