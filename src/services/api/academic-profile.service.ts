import { AI_TIMEOUT_MS, axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AcademicProfile, AcademicProfilePayload, ExtractedCv } from "@/types/academic-profile";

export const academicProfileService = {
  getByUserId: (userId: string) =>
    axiosClient.get<ApiResponse<AcademicProfile | null>>(`/users/${userId}/profile`).then((res) => res.data.data),

  /** AI đọc CV (PDF/DOCX) → các ô điền sẵn. Không ghi gì vào hồ sơ. */
  extractCv: (userId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<ApiResponse<ExtractedCv>>(`/users/${userId}/profile/extract-cv`, form, { timeout: AI_TIMEOUT_MS })
      .then((res) => res.data.data);
  },

  /** Lý lịch khoa học theo QĐ543 Biểu mẫu 02 (Word). */
  exportBm02: (userId: string) =>
    axiosClient.get<Blob>(`/users/${userId}/profile/export-bm02`, { responseType: "blob" }).then((res) => res.data),

  upsert: (userId: string, payload: AcademicProfilePayload) =>
    axiosClient.put<ApiResponse<AcademicProfile>>(`/users/${userId}/profile`, payload).then((res) => res.data.data),
};
