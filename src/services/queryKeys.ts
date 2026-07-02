import type { PaginationParams } from "@/types/common";

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  proposals: {
    all: () => ["proposals"] as const,
    list: (params?: Record<string, unknown>) => ["proposals", "list", params] as const,
    detail: (id: string) => ["proposals", "detail", id] as const,
    mine: () => ["proposals", "mine"] as const,
  },
  cycles: {
    all: () => ["cycles"] as const,
    list: (params?: PaginationParams) => ["cycles", "list", params] as const,
    detail: (id: string) => ["cycles", "detail", id] as const,
  },
  users: {
    all: () => ["users"] as const,
    list: (params?: PaginationParams) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  reviewRounds: {
    all: () => ["review-rounds"] as const,
    list: (proposalId: string) => ["review-rounds", "list", proposalId] as const,
  },
  councilMembers: {
    all: () => ["council-members"] as const,
    list: (councilId: string) => ["council-members", "list", councilId] as const,
  },
  meetings: {
    all: () => ["meetings"] as const,
    list: () => ["meetings", "list"] as const,
    byCouncil: (councilId: string) => ["meetings", "council", councilId] as const,
  },
  tracks: {
    all: () => ["tracks"] as const,
    list: () => ["tracks", "list"] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
  },
  analytics: {
    dashboard: (role: string) => ["analytics", "dashboard", role] as const,
    overview: () => ["analytics", "overview"] as const,
    byTrack: (cycleId?: number) => ["analytics", "by-track", cycleId] as const,
    funnel: (cycleId?: number) => ["analytics", "funnel", cycleId] as const,
  },
  researchTypes: {
    all: () => ["research-types"] as const,
    list: () => ["research-types", "list"] as const,
  },
  researchOrders: {
    all: () => ["research-orders"] as const,
    list: (params?: PaginationParams) => ["research-orders", "list", params] as const,
    detail: (id: number) => ["research-orders", "detail", id] as const,
  },
  budgetCategories: {
    all: () => ["budget-categories"] as const,
    list: () => ["budget-categories", "list"] as const,
  },
  financialConfigs: {
    all: () => ["financial-configs"] as const,
    list: () => ["financial-configs", "list"] as const,
  },
  organizationalUnits: {
    all: () => ["organizational-units"] as const,
    list: () => ["organizational-units", "list"] as const,
  },
  rubricCriteria: {
    all: () => ["rubric-criteria"] as const,
    list: (roundType?: string) => ["rubric-criteria", "list", roundType] as const,
  },
  memberships: {
    mine: () => ["memberships", "mine"] as const,
  },
  rubricTemplates: {
    all: () => ["rubric-templates"] as const,
    list: () => ["rubric-templates", "list"] as const,
  },
  scores: {
    my: (councilId: string) => ["scores", "my", councilId] as const,
  },
  feedback: {
    list: (councilId: string) => ["feedback", "list", councilId] as const,
  },
  acceptance: {
    detail: (councilId: string) => ["acceptance", "detail", councilId] as const,
  },
  decision: {
    detail: (councilId: string) => ["decision", "detail", councilId] as const,
  },
} as const;
