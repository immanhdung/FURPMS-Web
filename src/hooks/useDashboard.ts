import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api/analytics.service";
import { analyticsReportService } from "@/services/api/analytics-report.service";
import { queryKeys } from "@/services/queryKeys";
import { ROLES } from "@/constants/roles";
import type { AdminDashboardData } from "@/types/dashboard";

export function useAdminDashboardQuery() {
  const overview = useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: analyticsReportService.getOverview,
    staleTime: 60 * 1000,
  });
  const byTrack = useQuery({
    queryKey: queryKeys.analytics.byTrack(),
    queryFn: () => analyticsReportService.getByTrack(),
    staleTime: 60 * 1000,
  });

  const data: AdminDashboardData | undefined = overview.data && {
    kpis: [
      { id: "cycles", label: "Total Cycles", value: overview.data.totalCycles ?? 0 },
      { id: "proposals", label: "Total Proposals", value: overview.data.totalProposals ?? 0 },
      { id: "approved", label: "Approved Proposals", value: overview.data.approvedProposals ?? 0 },
      { id: "pending-reviews", label: "Pending Reviews", value: overview.data.pendingReviews ?? 0 },
      { id: "councils", label: "Total Councils", value: overview.data.totalCouncils ?? 0 },
      { id: "contracts", label: "Total Contracts", value: overview.data.totalContracts ?? 0 },
    ],
    monthlyTrend: overview.data.monthlyTrend ?? [],
    proposalsByField: (byTrack.data ?? []).map((item) => ({
      field: item.trackName ?? "Unknown",
      count: item.proposalCount ?? 0,
    })),
    budgetDistribution: overview.data.budgetDistribution ?? [],
    reviewProgress: overview.data.reviewProgress ?? [],
    activity: [],
  };

  return {
    data,
    isLoading: overview.isLoading || byTrack.isLoading,
    isError: overview.isError || byTrack.isError,
    isRefetching: overview.isRefetching || byTrack.isRefetching,
    refetch: () => Promise.all([overview.refetch(), byTrack.refetch()]),
  };
}

export function useStaffDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(ROLES.STAFF),
    queryFn: analyticsService.getStaffDashboard,
    staleTime: 60 * 1000,
  });
}

export function usePiDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(ROLES.FACULTY),
    queryFn: analyticsService.getPiDashboard,
    staleTime: 60 * 1000,
  });
}

export function useReviewerDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(ROLES.REVIEW_COMMITTEE),
    queryFn: analyticsService.getReviewerDashboard,
    staleTime: 60 * 1000,
  });
}
