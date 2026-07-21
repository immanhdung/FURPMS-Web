import type { CouncilMember } from "@/types/council-member";

export interface ReviewRound {
  id: string;
  roundNumber: number;
  dimension?: string | null;
  roundType?: string | null;
  rubricTemplateId?: number | null;
  sequence: number;
  prerequisiteRoundId?: string | null;
  status?: string | null;
  openedAt?: string | null;
  closedAt?: string | null;
  result?: string | null;
  councilId?: string | null;
  members?: CouncilMember[] | null;
}

export interface CreateReviewRoundPayload {
  dimension: string;
  roundType?: string;
  rubricTemplateId?: number;
  prerequisiteRoundId?: string;
}

export interface CloseRoundPayload {
  result?: string;
  /**
   * Only required when the round has multiple proposals (Phase B: one round can host several
   * councils, each grading a different proposal) — confirmed via a live 400 asking for it.
   * The staff proposal detail already has this exact proposal in view, so it's passed
   * automatically rather than asking the user to look it up.
   */
  proposalProjectId?: string;
}
