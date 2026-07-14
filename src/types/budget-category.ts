export interface BudgetCategory {
  id: number;
  code: string;
  name: string;
  sequence: number;
  isActive: boolean;
}

export interface BudgetCategoryPayload {
  code: string;
  name: string;
  sequence: number;
  isActive: boolean;
}
