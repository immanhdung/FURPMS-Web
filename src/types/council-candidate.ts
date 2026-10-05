/** Ứng viên ủy viên hội đồng — khớp `CouncilCandidatesResponse` của BE. */

export interface CouncilCandidate {
  userId: string;
  fullName: string;
  email?: string | null;
  academicTitle?: string | null;
  unitName?: string | null;
  /** Các lĩnh vực người này đã khai. */
  tracks: string[];
  /** Có làm đúng lĩnh vực của đề tài không (QĐ543 Điều 8.2). */
  matchesTrack: boolean;
  /**
   * Chưa khai lĩnh vực nào — **khác** với "khác lĩnh vực".
   * Gộp hai thứ này là oan cho người chưa được ai nhập hồ sơ.
   */
  expertiseUnknown: boolean;
  /** Xung đột lợi ích với đề tài — chủ nhiệm hoặc thành viên nhóm. */
  hasConflictOfInterest: boolean;
  alreadyInCouncil: boolean;
  /** Đang là ủy viên của bao nhiêu hội đồng khác chưa chốt. */
  activeCouncilCount: number;
}

export interface CouncilCandidates {
  trackId?: number | null;
  trackName?: string | null;
  matchingCount: number;
  totalCount: number;
  candidates: CouncilCandidate[];
}
