export interface ProposalSummary {
  id: string;
  titleVI?: string | null;
  titleEN?: string | null;
  cycleId?: number | null;
  cycleName?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  principalInvestigatorName?: string | null;
  status?: string | null;
  researchType?: number | null;
  /** Thời gian thực hiện — dùng để suy trần gia hạn (QĐ543 Điều 10.4: tối đa 1/2). */
  durationMonths?: number | null;
  createdAt?: string | null;
}

export interface ProposalListParams {
  cycleId?: number;
  trackId?: string;
  status?: string;
  type?: string;
  search?: string;
}
