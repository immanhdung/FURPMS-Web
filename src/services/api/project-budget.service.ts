import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProjectBudgetOverview } from "@/types/project-budget";

export const projectBudgetService = {
  /** Kinh phí nhìn theo ĐỀ TÀI — gộp dự toán đề cương + hợp đồng + các đợt giải ngân. */
  overview: (projectId: string) =>
    axiosClient
      .get<ApiResponse<ProjectBudgetOverview>>(`/projects/${projectId}/budget`)
      .then((res) => res.data.data),
};
