import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

// ─── Query Keys ───────────────────────────────────────────────────────
export const dashboardKeys = {
  overview: ["dashboard", "overview"],
  activity: ["dashboard", "activity"],
};

// ─── Queries ─────────────────────────────────────────────────────────

/** Fetch dashboard overview metrics */
export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: async () => {
      const { data } = await api.get("/analytics/overview");
      return data.data;
    },
    staleTime: 60_000, // 1 min — dashboard data can be slightly stale
  });
}

/** Fetch recent activity / notifications for timeline */
export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity,
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { limit: 5 } });
      return data.data || [];
    },
    staleTime: 30_000,
  });
}
