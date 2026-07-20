import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  CreateProgressReportPayload,
  EvaluateProgressReportPayload,
  ProgressReport,
  ScheduleProgressReportPayload,
} from "@/types/progress-report";

export const progressReportService = {
  list: (contractId: string) =>
    axiosClient
      .get<ApiResponse<ProgressReport[]>>("/progress-reports", { params: { contractId } })
      .then((res) => res.data.data),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<ProgressReport>>(`/progress-reports/${id}`).then((res) => res.data.data),

  create: (contractId: string, payload: CreateProgressReportPayload) =>
    axiosClient
      .post<ApiResponse<ProgressReport>>("/progress-reports", payload, { params: { contractId } })
      .then((res) => res.data.data),

  schedule: (id: string, payload: ScheduleProgressReportPayload) =>
    axiosClient
      .patch<ApiResponse<ProgressReport>>(`/progress-reports/${id}/schedule`, payload)
      .then((res) => res.data.data),

  evaluate: (id: string, payload: EvaluateProgressReportPayload) =>
    axiosClient
      .post<ApiResponse<ProgressReport>>(`/progress-reports/${id}/evaluate`, payload)
      .then((res) => res.data.data),
};
