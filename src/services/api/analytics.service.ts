import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  AdminDashboardData,
  PiDashboardData,
  ReviewerDashboardData,
  StaffDashboardData,
} from "@/types/dashboard";

export const analyticsService = {
  getAdminDashboard: () =>
    axiosClient.get<ApiResponse<AdminDashboardData>>("/analytics/dashboard/admin").then((res) => res.data.data),

  getStaffDashboard: () =>
    axiosClient.get<ApiResponse<StaffDashboardData>>("/analytics/dashboard/staff").then((res) => res.data.data),

  getPiDashboard: () =>
    axiosClient.get<ApiResponse<PiDashboardData>>("/analytics/dashboard/faculty").then((res) => res.data.data),

  getReviewerDashboard: () =>
    axiosClient
      .get<ApiResponse<ReviewerDashboardData>>("/analytics/dashboard/reviewer")
      .then((res) => res.data.data),
};
