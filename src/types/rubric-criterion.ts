export interface RubricCriterion {
  id: number;
  roundType: number;
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
