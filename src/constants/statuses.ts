export const PROPOSAL_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export const CYCLE_STATUS = {
  PLANNING: "PLANNING",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;
export type CycleStatus = (typeof CYCLE_STATUS)[keyof typeof CYCLE_STATUS];

/** Confirmed live: the backend actually returns "INVITED" for an awaiting-response invitation, not "PENDING". */
export const INVITATION_STATUS = {
  PENDING: "INVITED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
} as const;
export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

/**
 * `CouncilMemberResponse` has a `confirmedAt` field (not `acceptedAt`), which hints the accepted
 * state may be serialized as "CONFIRMED" rather than "ACCEPTED" — same class of mismatch as
 * PENDING/INVITED above. Check both until confirmed live against a real accepted membership.
 */
export function isAcceptedInvitation(status?: string | null): boolean {
  const normalized = status?.toUpperCase();
  return normalized === INVITATION_STATUS.ACCEPTED || normalized === "CONFIRMED";
}

export const REVIEW_ROUND_TYPE = {
  SCREENING: "SCREENING",
  REVIEW: "REVIEW",
  ACCEPTANCE: "ACCEPTANCE",
} as const;
export type ReviewRoundType = (typeof REVIEW_ROUND_TYPE)[keyof typeof REVIEW_ROUND_TYPE];

/** The backend rejects any other value here — confirmed via the "Dimension must be SCIENCE or FINANCE" validation error. */
export const ROUND_DIMENSION = {
  SCIENCE: "SCIENCE",
  FINANCE: "FINANCE",
} as const;
export type RoundDimension = (typeof ROUND_DIMENSION)[keyof typeof ROUND_DIMENSION];

/**
 * The backend's SaveCriterionRequest takes `roundType` as an integer enum ordinal with no
 * documented lookup. Best-effort mapping based on declaration order — verify once confirmed.
 */
export const ROUND_TYPE_ID_MAP: Record<ReviewRoundType, number> = {
  [REVIEW_ROUND_TYPE.SCREENING]: 0,
  [REVIEW_ROUND_TYPE.REVIEW]: 1,
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: 2,
};

export const REVIEW_DECISION = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
} as const;
export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION];

export const RESEARCH_TYPE = {
  BASIC: "BASIC",
  APPLIED: "APPLIED",
} as const;
export type ResearchType = (typeof RESEARCH_TYPE)[keyof typeof RESEARCH_TYPE];
