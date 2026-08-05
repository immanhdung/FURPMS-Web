import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AcademicProfile, AcademicProfilePayload } from "@/types/academic-profile";

export const academicProfileService = {
  getByUserId: (userId: string) =>
    axiosClient
      .get<ApiResponse<AcademicProfile | null>>(`/users/${userId}/profile`)
      .then((res) => res.data.data),

  upsert: (userId: string, payload: AcademicProfilePayload) =>
    axiosClient
      .put<ApiResponse<AcademicProfile>>(`/users/${userId}/profile`, payload)
      .then((res) => res.data.data),
};
