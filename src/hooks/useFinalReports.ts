import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { finalReportService } from "@/services/api/final-report.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SubmitFinalReportPayload } from "@/types/final-report";

export function useFinalReportQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.finalReports.detail(contractId ?? ""),
    queryFn: () => finalReportService.getByContract(contractId as string),
    enabled: Boolean(contractId),
    retry: false,
  });
}

/** Dùng chung cho mọi hành động trên báo cáo tổng kết — chỉ khác thông báo. */
function useFinalReportAction<TArgs>(
  contractId: string,
  action: (args: TArgs) => Promise<unknown>,
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.finalReports.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || errorMessage),
  });
}

export function useSubmitFinalReportMutation(contractId: string) {
  return useFinalReportAction<SubmitFinalReportPayload>(
    contractId,
    (payload) => finalReportService.submit(contractId, payload),
    "Final report submitted.",
    "Unable to submit the final report."
  );
}

export function useRequestFinalReportRevisionMutation(contractId: string) {
  return useFinalReportAction<{ id: string; revisionNotes: string }>(
    contractId,
    ({ id, revisionNotes }) => finalReportService.requestRevision(id, revisionNotes),
    "Revision requested.",
    "Unable to request a revision."
  );
}

export function useAcceptFinalReportMutation(contractId: string) {
  return useFinalReportAction<string>(
    contractId,
    (id) => finalReportService.accept(id),
    "Final report accepted.",
    "Unable to accept the final report."
  );
}

export function useArchiveFinalReportMutation(contractId: string) {
  return useFinalReportAction<string>(
    contractId,
    (id) => finalReportService.archive(id),
    "Final report archived.",
    "Unable to archive the final report."
  );
}
