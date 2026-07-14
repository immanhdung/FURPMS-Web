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
}
