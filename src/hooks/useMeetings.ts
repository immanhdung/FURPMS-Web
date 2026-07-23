import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { meetingService } from "@/services/api/meeting.service";
import { googleMeetService } from "@/services/api/google-meet.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { ScheduleMeetingPayload } from "@/types/meeting";

export function useMeetingsQuery() {
  return useQuery({
    queryKey: queryKeys.meetings.list(),
    queryFn: meetingService.list,
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
