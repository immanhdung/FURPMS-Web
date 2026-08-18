export interface AcceptancePayload {
  projectId: string;
  result: string;
  failReason?: string;
}

export interface AcceptanceResponse extends AcceptancePayload {
  id: number;
  councilId: string;
  submittedAt?: string | null;
}

export const ACCEPTANCE_RESULTS = ["PASS", "FAIL"] as const;
