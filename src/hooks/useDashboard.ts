import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { analyticsService } from "@/services/api/analytics.service";
import { analyticsReportService } from "@/services/api/analytics-report.service";
import { queryKeys } from "@/services/queryKeys";
import { ROLES } from "@/constants/roles";
import type { AdminDashboardData } from "@/types/dashboard";

export function useAdminDashboardQuery() {
  // Nhãn 6 ô KPI trước đây cắm cứng tiếng Anh ("Total Cycles"…) dù bảng `analytics.kpi*` đã có
  // sẵn cả vi lẫn en — bảng điều khiển tiếng Việt vẫn hiện nguyên tiếng Anh.
  const { t } = useTranslation();
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
      { id: "cycles", label: t("analytics.kpiCycles"), value: overview.data.totalCycles ?? 0 },
      { id: "proposals", label: t("analytics.kpiProposals"), value: overview.data.totalProposals ?? 0 },
      { id: "approved", label: t("analytics.kpiApproved"), value: overview.data.approvedProposals ?? 0 },
      { id: "pending-reviews", label: t("analytics.kpiPendingReviews"), value: overview.data.pendingReviews ?? 0 },
      { id: "councils", label: t("analytics.kpiCouncils"), value: overview.data.totalCouncils ?? 0 },
      { id: "contracts", label: t("analytics.kpiContracts"), value: overview.data.totalContracts ?? 0 },
    ],
    monthlyTrend: overview.data.monthlyTrend ?? [],
    proposalsByField: (byTrack.data ?? []).map((item) => ({
      // BE trả `total`; trước đây đọc `proposalCount` (không tồn tại) nên cột nào cũng bằng 0.
      field: item.trackName ?? t("common.unknown", { defaultValue: "—" }),
      count: item.total ?? 0,
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
