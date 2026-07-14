import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { SystemClockState } from "@/types/admin";

export const adminService = {
  getSystemClock: () =>
    axiosClient.get<ApiResponse<SystemClockState>>("/admin/system-clock").then((res) => res.data.data),

  setSystemClock: (offsetDays: number) =>
    axiosClient
      .post<ApiResponse<SystemClockState>>("/admin/system-clock", { offsetDays })
      .then((res) => res.data.data),

  runDeadlineScan: () => axiosClient.post<ApiResponse<null>>("/admin/run-deadline-scan").then((res) => res.data),
};
