import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { progressReportService } from "@/services/api/progress-report.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type {
  CreateProgressReportPayload,
  EvaluateProgressReportPayload,
  ScheduleProgressReportPayload,
} from "@/types/progress-report";

export function useProgressReportsQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.progressReports.list(contractId ?? ""),
    queryFn: () => progressReportService.list(contractId as string),
    enabled: Boolean(contractId),
  });
}

export function useCreateProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressReportPayload) => progressReportService.create(contractId, payload),
    onSuccess: () => {
      toast.success("Progress report period created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create progress report period."),
  });
}

export function useScheduleProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ScheduleProgressReportPayload }) =>
      progressReportService.schedule(id, payload),
    onSuccess: () => {
      toast.success("Progress report scheduled.");
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to schedule progress report."),
  });
}

export function useEvaluateProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EvaluateProgressReportPayload }) =>
      progressReportService.evaluate(id, payload),
    onSuccess: () => {
      toast.success("Progress report evaluated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to evaluate progress report."),
  });
}
