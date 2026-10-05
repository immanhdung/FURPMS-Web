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

/** Only Review and Final (acceptance) rounds are used in this project — Screening was removed project-wide. */
export const REVIEW_ROUND_TYPE = {
  REVIEW: "REVIEW",
  ACCEPTANCE: "ACCEPTANCE",
} as const;
export type ReviewRoundType = (typeof REVIEW_ROUND_TYPE)[keyof typeof REVIEW_ROUND_TYPE];

/** Confirmed live (seen in ReviewRound.status responses): PENDING before staff opens the round, OPEN once opened, CLOSED after closing. */
export const ROUND_STATUS = {
  PENDING: "PENDING",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;
export type RoundStatus = (typeof ROUND_STATUS)[keyof typeof ROUND_STATUS];

export const ROUND_TYPE_LABELS: Record<ReviewRoundType, string> = {
  [REVIEW_ROUND_TYPE.REVIEW]: "Review",
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: "Final",
};

/** The backend rejects any other value here — confirmed via the "Dimension must be SCIENCE or FINANCE" validation error. */
export const ROUND_DIMENSION = {
  SCIENCE: "SCIENCE",
  FINANCE: "FINANCE",
} as const;
export type RoundDimension = (typeof ROUND_DIMENSION)[keyof typeof ROUND_DIMENSION];

/**
 * The backend's SaveCriterionRequest takes `roundType` as an integer enum ordinal with no
 * documented lookup. Best-effort mapping based on declaration order — verify once confirmed.
 * Ordinals for Review/Acceptance are kept as originally mapped (1/2) even though Screening (0)
 * is no longer offered in the UI, since the backend's underlying enum may still reserve it.
 */
export const ROUND_TYPE_ID_MAP: Record<ReviewRoundType, number> = {
  [REVIEW_ROUND_TYPE.REVIEW]: 1,
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: 2,
};

/**
 * RubricCriterion.roundType is a *different* backend representation from ReviewRound.roundType:
 * ReviewRound's roundType is free text (echoes back whatever string was sent on create, e.g.
 * "REVIEW"). RubricCriterion's roundType is a real backend enum, serialized on read as its C#
 * member name — confirmed live as "ProposalReview" for what this app calls REVIEW. The
 * Acceptance/Final name below ("Acceptance") is inferred by naming symmetry with the
 * "AcceptanceEvaluations" API area and hasn't been confirmed live yet (a live test returned
 * "ProgressCheck" for one guessed ordinal, so treat "Acceptance" as unverified).
 *
 * Only used for *display* (mapping a criterion's roundType to a friendly label) — the
 * GET /rubric-criteria?roundType= query filter's expected value is unconfirmed and returned zero
 * results for a value that should have matched, so callers fetch unfiltered and match client-side
 * with `rubricRoundTypeToAppType` instead of relying on that filter.
 */
export const RUBRIC_ROUND_TYPE_NAME: Record<ReviewRoundType, string> = {
  [REVIEW_ROUND_TYPE.REVIEW]: "ProposalReview",
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: "Acceptance",
};

export function rubricRoundTypeToAppType(name?: string | null): ReviewRoundType | undefined {
  const entry = (Object.entries(RUBRIC_ROUND_TYPE_NAME) as [ReviewRoundType, string][]).find(
    ([, value]) => value === name
  );
  return entry?.[0];
}

export const REVIEW_DECISION = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
} as const;
export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION];

/** Exact strings expected by AddCouncilMemberRequest.memberRole (confirmed via the working create-member flow). */
export const COUNCIL_MEMBER_ROLE = {
  CHAIRMAN: "Chairman",
  SECRETARY: "Secretary",
  MEMBER: "Member",
} as const;
export type CouncilMemberRole = (typeof COUNCIL_MEMBER_ROLE)[keyof typeof COUNCIL_MEMBER_ROLE];

/**
 * The backend doesn't document response schemas for Disbursement/Settlement/FinalReport (the
 * swagger spec has request DTOs only, no response DTOs — same weak-typing pattern seen elsewhere
 * in this API). Status field names/values below are unconfirmed guesses following the naming
 * convention of confirmed enums elsewhere (e.g. REVIEW_DECISION); verify against a live response
 * and adjust once seen.
 */
export const DISBURSEMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
} as const;

export const SETTLEMENT_STATUS = {
  DRAFT: "DRAFT",
  SIGNED: "SIGNED",
  ACCOUNTING_CLEARED: "ACCOUNTING_CLEARED",
  ASSETS_CLEARED: "ASSETS_CLEARED",
  COMPLETED: "COMPLETED",
} as const;

export const FINAL_REPORT_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  ACCEPTED: "ACCEPTED",
  ARCHIVED: "ARCHIVED",
} as const;

export const RESEARCH_TYPE = {
  BASIC: "BASIC",
  APPLIED: "APPLIED",
} as const;
export type ResearchType = (typeof RESEARCH_TYPE)[keyof typeof RESEARCH_TYPE];
