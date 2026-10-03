export interface MyMembership {
  memberId: string;
  councilId: string;
  /** Trạng thái nhận lời RIÊNG đề tài của dòng này (INVITED/CONFIRMED/DECLINED); null = theo hội đồng. */
  projectInviteStatus?: string | null;
  projectDeclineReason?: string | null;
  roundId?: string | null;
  roundType?: string | null;
  roundStatus?: string | null;
  memberRole?: string | null;
  status?: string | null;
  proposalId: string;
  /** Round-scoped project id — what SaveMinutes/FinalizeDecision require, distinct from proposalId. */
  projectId: string;
  proposalTitleVI?: string | null;
  proposalStatus?: string | null;
  piName?: string | null;
  cycleId?: number | null;
  cycleCode?: string | null;
  trackId?: number | null;
  trackName?: string | null;
  createdAt?: string | null;
  nextMeetingAt?: string | null;
}
