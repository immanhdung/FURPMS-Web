export interface CouncilMember {
  id: string;
  councilId: string;
  userId: string;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  memberRole?: string | null;
  isExternal: boolean;
  status?: string | null;
  invitationSentAt?: string | null;
  confirmedAt?: string | null;
  declinedAt?: string | null;
}

export interface AddCouncilMemberPayload {
  userId: string;
  memberRole?: string;
  isExternal: boolean;
}

export interface RespondMembershipPayload {
  accept: boolean;
  declineReason?: string;
}
