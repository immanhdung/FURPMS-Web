import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProjectDecisionDossier } from "@/types/project-decision";

export const projectDecisionService = {
  /** Toàn bộ quyết định đã ra với đề tài, xếp theo thời gian. */
  get: (projectId: string) =>
    axiosClient
      .get<ApiResponse<ProjectDecisionDossier>>(`/projects/${projectId}/decisions`)
      .then((res) => res.data.data),
};
