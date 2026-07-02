import type { RubricCriterion } from "@/types/rubric-criterion";

export interface RubricTemplate {
  id: number;
  name?: string | null;
  roundType?: string | null;
  criteria?: RubricCriterion[] | null;
}

export interface ScoreDetailPayload {
  criterionId: number;
  givenScore: number;
  comments?: string;
}

export interface SubmitScorePayload {
  templateId: number;
  generalComments?: string;
  otherRecommendations?: string;
  scoreDetails: ScoreDetailPayload[];
}

export interface ScoreResponse {
  id: string;
  councilId: string;
  reviewerId?: string;
  templateId: number;
  generalComments?: string | null;
  otherRecommendations?: string | null;
  scoreDetails?: ScoreDetailPayload[] | null;
  submittedAt?: string | null;
}
