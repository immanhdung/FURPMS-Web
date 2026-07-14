export interface Council {
  id: string;
  proposalId: string;
  roundId?: string | null;
  councilType?: string | null;
  establishmentDecisionNo?: string | null;
  establishedAt?: string | null;
  meetingDeadline?: string | null;
  minMembersRequired: number;
  maxMembersAllowed: number;
  status?: string | null;
  createdAt: string;
}

export interface CreateCouncilPayload {
  proposalId: string;
  roundId: string;
  councilType?: string;
  establishmentDecisionNo?: string;
  establishedAt?: string;
  meetingDeadline?: string;
  minMembersRequired: number;
  maxMembersAllowed: number;
}

export interface SendInvitationsPayload {
  confirmDeadline?: string;
}
