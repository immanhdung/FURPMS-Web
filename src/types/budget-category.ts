export interface BudgetCategory {
  id: number;
  code: string;
  name: string;
  sequence: number;
  /** Tỷ lệ tối đa trên tổng dự toán (QĐ543 Điều 15.1); null = hạng mục cũ, không soi tỷ lệ. */
  maxPercentage?: number | null;
  isActive: boolean;
}

export interface BudgetCategoryPayload {
  code: string;
  name: string;
  sequence: number;
  maxPercentage?: number | null;
  isActive: boolean;
}
