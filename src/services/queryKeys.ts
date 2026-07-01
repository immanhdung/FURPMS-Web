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
} as const;
