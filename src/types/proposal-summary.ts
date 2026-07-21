export interface ProposalSummary {
  id: string;
  titleVI?: string | null;
  titleEN?: string | null;
  cycleId?: number | null;
  cycleName?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  status?: string | null;
  researchType?: number | null;
  createdAt?: string | null;
}

export interface ProposalListParams {
  cycleId?: number;
  trackId?: string;
  status?: string;
  type?: string;
  search?: string;
}
