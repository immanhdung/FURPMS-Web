import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Meeting, ScheduleMeetingPayload } from "@/types/meeting";

export const meetingService = {
  list: () => axiosClient.get<ApiResponse<Meeting[]>>("/meetings").then((res) => res.data.data),

  create: (councilId: string, payload: ScheduleMeetingPayload) =>
    axiosClient
      .post<ApiResponse<Meeting>>(`/councils/${councilId}/meetings`, payload)
      .then((res) => res.data.data),

  listByCouncil: (councilId: string) =>
    axiosClient.get<ApiResponse<Meeting[]>>(`/councils/${councilId}/meetings`).then((res) => res.data.data),

  start: (id: string) => axiosClient.post<ApiResponse<Meeting>>(`/meetings/${id}/start`).then((res) => res.data.data),

  end: (id: string) => axiosClient.post<ApiResponse<Meeting>>(`/meetings/${id}/end`).then((res) => res.data.data),
};
