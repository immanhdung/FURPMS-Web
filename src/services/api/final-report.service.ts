import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { FinalReport, SubmitFinalReportPayload } from "@/types/final-report";

export const finalReportService = {
  /** Trả `null` khi PI chưa nộp lần nào. */
  getByContract: (contractId: string) =>
    axiosClient.get<ApiResponse<FinalReport | null>>(`/final-reports/${contractId}`).then((res) => res.data.data),

  submit: (contractId: string, payload: SubmitFinalReportPayload) =>
    axiosClient
      .post<ApiResponse<FinalReport>>(`/final-reports/${contractId}/submit`, payload)
      .then((res) => res.data.data),

  requestRevision: (id: string, revisionNotes: string) =>
    axiosClient
      .post<ApiResponse<FinalReport>>(`/final-reports/${id}/request-revision`, { revisionNotes })
      .then((res) => res.data.data),

  accept: (id: string) =>
    axiosClient.post<ApiResponse<FinalReport>>(`/final-reports/${id}/accept`).then((res) => res.data.data),

  archive: (id: string) =>
    axiosClient.post<ApiResponse<FinalReport>>(`/final-reports/${id}/archive`).then((res) => res.data.data),

  /** Mở lại báo cáo đã tiếp nhận / lưu trữ — lý do bắt buộc. */
  reopen: (id: string, reason: string) =>
    axiosClient.post<ApiResponse<FinalReport>>(`/final-reports/${id}/reopen`, { reason }).then((res) => res.data.data),
};
