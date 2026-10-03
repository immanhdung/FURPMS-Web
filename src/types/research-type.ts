export interface ResearchType {
  id: number;
  code: string;
  name: string;
  maxBudgetCap: number;
  requireOrderingUnit: boolean;
  isActive: boolean;
  /** BASIC / APPLIED — chính là mã cố định (hệ thống chỉ có 2 loại, 03/10). */
  kind?: "BASIC" | "APPLIED";
  progressRounds?: number;
  disbursementRounds?: number;
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
