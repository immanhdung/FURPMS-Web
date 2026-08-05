import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { progressReportService } from "@/services/api/progress-report.service";
import { progressReportDocumentService } from "@/services/api/progress-report-document.service";
import { researchContentService } from "@/services/api/research-content.service";
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

/**
 * Chi tiết 1 kỳ báo cáo — gồm nội dung PI viết + bảng hoạt động (BM06).
 * Danh sách chỉ trả bản tóm tắt (%, trạng thái) nên trước đây Staff mở ra đánh giá mà
 * KHÔNG hề thấy PI đã viết gì; endpoint này có sẵn ở BE nhưng chưa nơi nào gọi.
 */
export function useProgressReportQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.progressReports.detail(id ?? ""),
    queryFn: () => progressReportService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressReportPayload) => progressReportService.create(contractId, payload),
    onSuccess: () => {
      toast.success("Progress report saved.");
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to save progress report."),
  });
}

/** File báo cáo (BM06) — Staff cần xem file này rồi mới đánh giá Đạt/Không đạt. */
export function useProgressReportDocumentsQuery(reportId: string | null) {
  return useQuery({
    queryKey: queryKeys.progressReports.documents(reportId ?? ""),
    queryFn: () => progressReportDocumentService.list(reportId as string),
    enabled: Boolean(reportId),
  });
}

export function useUploadProgressReportDocMutation(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => progressReportDocumentService.upload(reportId, file),
    onSuccess: () => {
      toast.success(i18n.t("toast.reportFileUploaded"));
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.documents(reportId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.uploadFailed")),
  });
}

export function useGenerateProgressRoundsMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundCount?: number) => progressReportService.generate(contractId, roundCount),
    onSuccess: () => {
      toast.success(i18n.t("toast.roundsGenerated"));
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.roundsGenerateFailed")),
  });
}

export function useUpdateProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateProgressReportPayload }) =>
      progressReportService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.reportSaveFailed")),
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

export function useSubmitProgressReportMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => progressReportService.submit(id),
    onSuccess: () => {
      toast.success("Progress report submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.progressReports.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit progress report."),
  });
}

/**
 * Hoạt động đã cam kết trong đề cương — nguồn cho BẢNG TIẾN ĐỘ THEO HOẠT ĐỘNG của BM06.
 * PI báo % hoàn thành từng hoạt động thay vì chỉ viết văn xuôi.
 */
export function useProposalActivitiesQuery(proposalId: string | null) {
  return useQuery({
    queryKey: ["research-contents", proposalId ?? ""],
    queryFn: () => researchContentService.listByProposal(proposalId as string),
    enabled: Boolean(proposalId),
    select: (contents) => contents.flatMap((c) => c.activities ?? []),
  });
}
