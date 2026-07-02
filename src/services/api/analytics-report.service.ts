import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AnalyticsOverview, FunnelStageItem, TrackAnalyticsItem } from "@/types/analytics-report";

export const analyticsReportService = {
  getOverview: () =>
    axiosClient.get<ApiResponse<AnalyticsOverview>>("/analytics/overview").then((res) => res.data.data),

  getByTrack: (cycleId?: number) =>
    axiosClient
      .get<ApiResponse<TrackAnalyticsItem[]>>("/analytics/by-track", { params: cycleId ? { cycleId } : undefined })
      .then((res) => res.data.data),

  getFunnel: (cycleId?: number) =>
    axiosClient
      .get<ApiResponse<FunnelStageItem[]>>("/analytics/funnel", { params: cycleId ? { cycleId } : undefined })
      .then((res) => res.data.data),
};
