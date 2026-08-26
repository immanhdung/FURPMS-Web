import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProjectTimeline } from "@/types/project-timeline";

export const projectTimelineService = {
  /** Mọi giai đoạn của đề tài kèm hạn và căn cứ của hạn. */
  get: (projectId: string) =>
    axiosClient
      .get<ApiResponse<ProjectTimeline>>(`/projects/${projectId}/timeline`)
      .then((res) => res.data.data),
};
