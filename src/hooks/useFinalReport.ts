import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { finalReportService } from "@/services/api/final-report.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { RequestFinalReportRevisionPayload, SubmitFinalReportPayload } from "@/types/final-report";

export function useFinalReportQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.finalReports.detail(contractId ?? ""),
    queryFn: () => finalReportService.get(contractId as string),
    enabled: Boolean(contractId),
    retry: false,
  });
}

export function useSubmitFinalReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitFinalReportPayload) => finalReportService.submit(contractId, payload),
    onSuccess: () => {
      toast.success("Final report submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.finalReports.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit final report."),
  });
}

export function useRequestFinalReportRevisionMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RequestFinalReportRevisionPayload }) =>
      finalReportService.requestRevision(id, payload),
    onSuccess: () => {
      toast.success("Revision requested.");
      queryClient.invalidateQueries({ queryKey: queryKeys.finalReports.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to request revision."),
  });
}

export function useAcceptFinalReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => finalReportService.accept(id),
    onSuccess: () => {
      toast.success("Final report accepted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.finalReports.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to accept final report."),
  });
}

export function useArchiveFinalReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => finalReportService.archive(id),
    onSuccess: () => {
      toast.success("Final report archived.");
      queryClient.invalidateQueries({ queryKey: queryKeys.finalReports.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to archive final report."),
  });
}
