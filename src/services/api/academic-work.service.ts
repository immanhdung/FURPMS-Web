import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AcademicWork, AcademicWorkPayload } from "@/types/academic-work";

export const academicWorkService = {
  list: (userId: string) =>
    axiosClient
      .get<ApiResponse<AcademicWork[]>>(`/users/${userId}/academic-works`)
      .then((res) => res.data.data),

  create: (userId: string, payload: AcademicWorkPayload) =>
    axiosClient
      .post<ApiResponse<AcademicWork>>(`/users/${userId}/academic-works`, payload)
      .then((res) => res.data.data),

  update: (userId: string, workId: string, payload: AcademicWorkPayload) =>
    axiosClient
      .put<ApiResponse<AcademicWork>>(`/users/${userId}/academic-works/${workId}`, payload)
      .then((res) => res.data.data),

  remove: (userId: string, workId: string) =>
    axiosClient.delete<ApiResponse>(`/users/${userId}/academic-works/${workId}`).then((res) => res.data),
};
