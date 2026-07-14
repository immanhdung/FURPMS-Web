import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { PiDashboardData, ReviewerDashboardData, StaffDashboardData } from "@/types/dashboard";

export const analyticsService = {
  getStaffDashboard: () =>
    axiosClient.get<ApiResponse<StaffDashboardData>>("/analytics/dashboard/staff").then((res) => res.data.data),

  getPiDashboard: () =>
    axiosClient.get<ApiResponse<PiDashboardData>>("/analytics/dashboard/faculty").then((res) => res.data.data),

  getReviewerDashboard: () =>
    axiosClient
      .get<ApiResponse<ReviewerDashboardData>>("/analytics/dashboard/reviewer")
      .then((res) => res.data.data),
};
