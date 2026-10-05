import type { CouncilMember } from "@/types/council-member";

// Khớp ReviewBoardDto của BE (FURPMS.Application/DTOs/ReviewRounds/ReviewBoardDto.cs).
export interface ReviewBoardProject {
  projectId: string;
  proposalId: string;
  titleVi: string;
  projectStatus: string;
  /** Chủ nhiệm — dùng để loại khỏi danh sách chọn ủy viên hội đồng (COI, rule #5). */
  piUserId: string;
}

export interface ReviewBoardProjectRound {
  projectId: string;
  titleVi: string;
  status: string;
  result?: string | null;
  /** Chủ nhiệm — dùng để loại khỏi danh sách chọn ủy viên hội đồng (COI, rule #5). */
  piUserId: string;
}

export interface ReviewBoardCouncil {
  id: string;
  status: string;
  projectIds: string[];
  members: CouncilMember[];
}

export interface ReviewBoardRound {
  id: string;
  roundNumber: number;
  dimension: string;
  roundType: string;
  status: string;
  result?: string | null;
  /** Bộ tiêu chí gắn RIÊNG cho vòng này; null = dùng bộ theo (đợt + lĩnh vực). */
  rubricTemplateId?: number | null;
  canDelete: boolean;
  /** Hạn chấm HIỆU LỰC (đã tính gia hạn) — null = chưa đặt hạn. */
  scoringDeadline?: string | null;
  /** Chỉ true khi vòng còn MỞ và đã quá hạn — vòng đã chốt thì hạn hết ý nghĩa. */
  isScoringOverdue?: boolean;
  /** Số ngày còn lại — do MÁY CHỦ tính, âm = quá hạn. */
  scoringDaysLeft?: number | null;
  projects: ReviewBoardProjectRound[];
  councils: ReviewBoardCouncil[];
}

export interface ReviewBoardData {
  projects: ReviewBoardProject[];
  rounds: ReviewBoardRound[];
}

export interface CreateTrackRoundPayload {
  dimension: string;
  roundType: string;
  rubricTemplateId?: number;
  prerequisiteRoundId?: string;
  /** Để trống → BE tự gom mọi đề tài SUBMITTED/REVISION của lĩnh vực chưa vào vòng. */
  projectIds?: string[];
}

export interface CouncilPackageMember {
  userId: string;
  memberRole: string;
  isExternal: boolean;
  /** Đồng ý gán người không khai đúng lĩnh vực (QĐ543 Điều 8.2) — xem `expertiseNote`. */
  acceptWithoutExpertise?: boolean;
  /** Lý do gán người ngoài lĩnh vực — bắt buộc khi `acceptWithoutExpertise` = true. */
  expertiseNote?: string;
}

export interface CreateCouncilPackagePayload {
  councilType?: string;
  projectIds: string[];
  members: CouncilPackageMember[];
}
