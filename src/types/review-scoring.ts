/**
 * Confirmed live: a rubric template's nested criteria are a *different* shape from the
 * standalone RubricCriterion (used by /rubric-criteria) — no `isActive` field, and the name is
 * `criterionName` not `name`. The template's own `criteria` array is the authoritative, complete
 * list of what must be scored for it — don't cross-reference against the standalone list.
 */
export interface RubricTemplateCriterion {
  id: number;
  criterionName: string;
  maxScore: number;
  sequence: number;
}

export interface RubricTemplate {
  id: number;
  /** Confirmed live as e.g. "REVIEW" / "PROGRESS_CHECK" — matches this app's REVIEW_ROUND_TYPE casing directly. */
  templateType?: string | null;
  name?: string | null;
  maxTotalScore?: number | null;
  isActive?: boolean;
  criteria?: RubricTemplateCriterion[] | null;
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
