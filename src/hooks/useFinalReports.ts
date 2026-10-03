import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
  errorMessage: string,
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
    i18n.t("toast.finalReportSubmitted"),
    i18n.t("toast.actionFailed"),
  );
}

export function useRequestFinalReportRevisionMutation(contractId: string) {
  return useFinalReportAction<{ id: string; revisionNotes: string }>(
    contractId,
    ({ id, revisionNotes }) => finalReportService.requestRevision(id, revisionNotes),
    i18n.t("toast.finalReportRevision"),
    i18n.t("toast.actionFailed"),
  );
}

export function useAcceptFinalReportMutation(contractId: string) {
  return useFinalReportAction<string>(
    contractId,
    (id) => finalReportService.accept(id),
    i18n.t("toast.finalReportAccepted"),
    i18n.t("toast.actionFailed"),
  );
}

export function useArchiveFinalReportMutation(contractId: string) {
  return useFinalReportAction<string>(
    contractId,
    (id) => finalReportService.archive(id),
    i18n.t("toast.finalReportArchived"),
    i18n.t("toast.actionFailed"),
  );
}

export function useReopenFinalReportMutation(contractId: string) {
  return useFinalReportAction<{ id: string; reason: string }>(
    contractId,
    ({ id, reason }) => finalReportService.reopen(id, reason),
    i18n.t("toast.resultReopened"),
    i18n.t("toast.actionFailed"),
  );
}
