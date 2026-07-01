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

export const INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
} as const;
export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

export const REVIEW_ROUND_TYPE = {
  SCREENING: "SCREENING",
  REVIEW: "REVIEW",
  ACCEPTANCE: "ACCEPTANCE",
} as const;
export type ReviewRoundType = (typeof REVIEW_ROUND_TYPE)[keyof typeof REVIEW_ROUND_TYPE];

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
