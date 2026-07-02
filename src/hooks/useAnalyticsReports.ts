import { useQuery } from "@tanstack/react-query";
import { analyticsReportService } from "@/services/api/analytics-report.service";
import { queryKeys } from "@/services/queryKeys";

export function useAnalyticsOverviewQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: analyticsReportService.getOverview,
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsByTrackQuery(cycleId?: number) {
  return useQuery({
    queryKey: queryKeys.analytics.byTrack(cycleId),
    queryFn: () => analyticsReportService.getByTrack(cycleId),
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsFunnelQuery(cycleId?: number) {
  return useQuery({
    queryKey: queryKeys.analytics.funnel(cycleId),
    queryFn: () => analyticsReportService.getFunnel(cycleId),
    staleTime: 60 * 1000,
  });
}
