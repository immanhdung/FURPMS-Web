export interface RubricCriterion {
  id: number;
  /** Returned by the backend as its enum member name (e.g. "ProposalReview"), not an integer. */
  roundType: string;
  orderIndex: number;
  name: string;
  maxScore: number;
  isActive: boolean;
}

export interface RubricCriterionPayload {
  roundType: number;
  orderIndex: number;
  name: string;
  maxScore: number;
  isActive: boolean;
}
