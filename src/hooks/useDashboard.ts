import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api/analytics.service";
import { queryKeys } from "@/services/queryKeys";
import { ROLES } from "@/constants/roles";

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(ROLES.ADMIN),
    queryFn: analyticsService.getAdminDashboard,
    staleTime: 60 * 1000,
  });
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
