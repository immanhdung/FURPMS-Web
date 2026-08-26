import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { UpcomingDeadline } from "@/types/project-timeline";

export const myDeadlinesService = {
  /** Hạn sắp tới (và đã quá) của chính người đang đăng nhập, gộp từ mọi đề tài họ liên quan. */
  list: (days = 30) =>
    axiosClient
      .get<ApiResponse<UpcomingDeadline[]>>(`/me/deadlines?days=${days}`)
      .then((res) => res.data.data),
};
