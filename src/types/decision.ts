export interface DecisionResponse {
  id: string;
  councilId: string;
  result?: string | null;
  councilComments?: string | null;
  recommendations?: string | null;
  chairUserId?: string | null;
  secretaryUserId?: string | null;
  finalizedAt?: string | null;
}
