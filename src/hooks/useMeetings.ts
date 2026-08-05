import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { meetingService } from "@/services/api/meeting.service";
import { googleMeetService } from "@/services/api/google-meet.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { AttendanceEntry, ScheduleMeetingPayload } from "@/types/meeting";

export function useMeetingsQuery() {
  return useQuery({
    queryKey: queryKeys.meetings.list(),
    queryFn: meetingService.list,
  });
}

/** Lịch họp hội đồng chấm đề tài của tôi (PI). */
export function useMyMeetingsQuery() {
  return useQuery({
    queryKey: queryKeys.meetings.mine(),
    queryFn: meetingService.mine,
  });
}

export function useCouncilMeetingsQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.meetings.byCouncil(councilId ?? ""),
    queryFn: () => meetingService.listByCouncil(councilId as string),
    enabled: Boolean(councilId),
  });
}

/** Cảnh báo giảng viên trùng lịch với hội đồng khác (rule tuần 10). */
export function useScheduleConflictsQuery(councilId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.meetings.byCouncil(councilId ?? ""), "conflicts"],
    queryFn: () => meetingService.scheduleConflicts(councilId as string),
    enabled: Boolean(councilId),
  });
}

const attendanceKey = (meetingId: string) => ["meeting-attendance", meetingId] as const;

/** Điểm danh buổi họp (rule tuần 10) — theo DS hội đồng. */
export function useMeetingAttendanceQuery(meetingId: string | null) {
  return useQuery({
    queryKey: attendanceKey(meetingId ?? ""),
    queryFn: () => meetingService.getAttendance(meetingId as string),
    enabled: Boolean(meetingId),
  });
}

export function useSaveAttendanceMutation(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: AttendanceEntry[]) => meetingService.saveAttendance(meetingId, entries),
    onSuccess: () => {
      toast.success(i18n.t("toast.attendanceSaved"));
      queryClient.invalidateQueries({ queryKey: attendanceKey(meetingId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.attendanceFailed")),
  });
}

export function useScheduleMeetingMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScheduleMeetingPayload) => meetingService.create(councilId, payload),
    onSuccess: () => {
      toast.success("Meeting scheduled.");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.byCouncil(councilId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to schedule meeting."),
  });
}

export function useUpdateMeetingMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ScheduleMeetingPayload }) =>
      meetingService.update(id, payload),
    onSuccess: () => {
      toast.success("Meeting updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.byCouncil(councilId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update meeting."),
  });
}

export function useDeleteMeetingMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingService.remove(id),
    onSuccess: () => {
      toast.success("Meeting deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.byCouncil(councilId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all() });
    },
    // BE trả 409 kèm lý do ("đã có điểm danh"...) — hiện nguyên văn.
    onError: (error: ApiError) => toast.error(error.message || "Unable to delete meeting."),
  });
}

export function useStartMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingService.start(id),
    onSuccess: () => {
      toast.success("Meeting started.");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to start meeting."),
  });
}

export function useEndMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingService.end(id),
    onSuccess: () => {
      toast.success("Meeting ended.");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to end meeting."),
  });
}

export function useGenerateGoogleMeetLink() {
  return useMutation({
    mutationFn: () => googleMeetService.generateLink(),
    onError: () => toast.error("Unable to generate a Google Meet link."),
  });
}
