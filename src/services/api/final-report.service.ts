import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { FinalReport, RequestFinalReportRevisionPayload, SubmitFinalReportPayload } from "@/types/final-report";

export const finalReportService = {
  get: (contractId: string) =>
    axiosClient
      .get<ApiResponse<FinalReport | null>>(`/final-reports/${contractId}`)
      .then((res) => res.data.data),

  submit: (contractId: string, payload: SubmitFinalReportPayload) =>
    axiosClient
      .post<ApiResponse<FinalReport>>(`/final-reports/${contractId}/submit`, payload)
      .then((res) => res.data.data),

  requestRevision: (id: string, payload: RequestFinalReportRevisionPayload) =>
    axiosClient
      .post<ApiResponse<FinalReport>>(`/final-reports/${id}/request-revision`, payload)
      .then((res) => res.data.data),

  accept: (id: string) =>
    axiosClient.post<ApiResponse<FinalReport>>(`/final-reports/${id}/accept`).then((res) => res.data.data),

  archive: (id: string) =>
    axiosClient.post<ApiResponse<FinalReport>>(`/final-reports/${id}/archive`).then((res) => res.data.data),
};
