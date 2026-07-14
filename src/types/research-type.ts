export interface ResearchType {
  id: number;
  code: string;
  name: string;
  maxBudgetCap: number;
  requireOrderingUnit: boolean;
  isActive: boolean;
}

export interface CreateResearchTypePayload {
  code: string;
  name: string;
  maxBudgetCap: number;
  requireOrderingUnit: boolean;
}

export interface UpdateResearchTypePayload {
  name?: string;
  maxBudgetCap?: number;
  requireOrderingUnit?: boolean;
}
