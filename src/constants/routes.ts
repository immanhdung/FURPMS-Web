export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",

  DASHBOARD: "/dashboard",

  RESEARCH_CYCLES: "/research-cycles",
  RESEARCH_TYPES: "/research-types",
  RESEARCH_ORDERS: "/research-orders",
  USERS: "/users",
  ORGANIZATIONAL_UNITS: "/organizational-units",
  RUBRIC_CRITERIA: "/rubric-criteria",
  BUDGET_CATEGORIES: "/budget-categories",
  FINANCIAL_CONFIG: "/financial-config",
  ANALYTICS: "/analytics",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",

  PROPOSAL_REVIEWS: "/proposal-reviews",
  REVIEW_BOARD: "/review-board",
  COUNCILS: "/councils",
  MEETINGS: "/meetings",
  ASSIGNMENTS: "/assignments",
  CONTRACTS: "/contracts",

  MY_PROPOSALS: "/my-proposals",
  SUBMIT_PROPOSAL: "/proposals/submit",
  PROGRESS_REPORTS: "/progress-reports",
  FINAL_REPORTS: "/final-reports",
  AI_SEARCH: "/ai-search",

  INVITATIONS: "/invitations",
  ASSIGNED_REVIEWS: "/assigned-reviews",
  SCORING: "/scoring",
  COUNCIL_MEMBERSHIPS: "/council-memberships",

  // New feature routes
  CHANGE_REQUESTS: "/change-requests",
  DOCUMENTS: "/documents",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
