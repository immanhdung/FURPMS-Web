export interface FinancialConfig {
  id: number;
  code: string;
  value: number;
  description?: string | null;
  effectiveDate: string;
  isActive: boolean;
}

export interface FinancialConfigPayload {
  code: string;
  value: number;
  description?: string;
  effectiveDate: string;
  isActive: boolean;
}
