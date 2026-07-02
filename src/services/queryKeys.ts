import type { PaginationParams } from "@/types/common";

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  proposals: {
    all: () => ["proposals"] as const,
    list: (params?: PaginationParams) => ["proposals", "list", params] as const,
    detail: (id: string) => ["proposals", "detail", id] as const,
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
  councils: {
    all: () => ["councils"] as const,
    list: (params?: PaginationParams) => ["councils", "list", params] as const,
    detail: (id: string) => ["councils", "detail", id] as const,
  },
  meetings: {
    all: () => ["meetings"] as const,
    list: (params?: PaginationParams) => ["meetings", "list", params] as const,
    detail: (id: string) => ["meetings", "detail", id] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
  },
  analytics: {
    dashboard: (role: string) => ["analytics", "dashboard", role] as const,
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
} as const;
