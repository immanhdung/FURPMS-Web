import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AttendanceEntry, Meeting, ScheduleConflict, ScheduleMeetingPayload } from "@/types/meeting";

export const meetingService = {
  list: () => axiosClient.get<ApiResponse<Meeting[]>>("/meetings").then((res) => res.data.data),

  /** Lịch họp hội đồng chấm đề tài CỦA TÔI (PI) — PI phải trình bày trước hội đồng. */
  mine: () => axiosClient.get<ApiResponse<Meeting[]>>("/meetings/my").then((res) => res.data.data),

  create: (councilId: string, payload: ScheduleMeetingPayload) =>
    axiosClient
      .post<ApiResponse<Meeting>>(`/councils/${councilId}/meetings`, payload)
      .then((res) => res.data.data),

  listByCouncil: (councilId: string) =>
    axiosClient.get<ApiResponse<Meeting[]>>(`/councils/${councilId}/meetings`).then((res) => res.data.data),

  start: (id: string) => axiosClient.post<ApiResponse<Meeting>>(`/meetings/${id}/start`).then((res) => res.data.data),

  end: (id: string) => axiosClient.post<ApiResponse<Meeting>>(`/meetings/${id}/end`).then((res) => res.data.data),

  scheduleConflicts: (councilId: string) =>
    axiosClient
      .get<ApiResponse<ScheduleConflict[]>>(`/councils/${councilId}/schedule-conflicts`)
      .then((res) => res.data.data),

  getAttendance: (meetingId: string) =>
    axiosClient.get<ApiResponse<AttendanceEntry[]>>(`/meetings/${meetingId}/attendance`).then((res) => res.data.data),

  saveAttendance: (meetingId: string, entries: AttendanceEntry[]) =>
    axiosClient.put<ApiResponse<null>>(`/meetings/${meetingId}/attendance`, { entries }).then((res) => res.data),
};
