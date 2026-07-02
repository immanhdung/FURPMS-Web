export interface AcceptancePayload {
  result: string;
  failReason?: string;
}

export interface AcceptanceResponse extends AcceptancePayload {
  id: string;
  councilId: string;
  submittedAt?: string | null;
}

export const ACCEPTANCE_RESULTS = ["PASS", "FAIL"] as const;
