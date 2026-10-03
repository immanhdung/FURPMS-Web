import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { disbursementService } from "@/services/api/disbursement.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { ConfirmDisbursementPayload } from "@/types/disbursement";

export function useDisbursementsQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.disbursements.list(contractId ?? ""),
    queryFn: () => disbursementService.listByContract(contractId as string),
    enabled: Boolean(contractId),
  });
}

/** Sinh lịch giải ngân — BE trả 409 nếu đã sinh rồi, hoặc PARTIAL mà chưa có sản phẩm nào. */
export function useGenerateDisbursementsMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => disbursementService.generate(contractId),
    onSuccess: (tranches) => {
      toast.success(i18n.t("toast.disbursementsGenerated", { n: tranches?.length ?? 0 }));
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.actionFailed")),
  });
}

/** Gắn/gỡ sản phẩm minh chứng cho 1 đợt (P5). BE chặn nếu sản phẩm khác hợp đồng, hoặc đợt đã giải ngân. */
export function useLinkDeliverableMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deliverableId }: { id: number; deliverableId: number | null }) =>
      disbursementService.linkDeliverable(id, { deliverableId }),
    onSuccess: () => {
      toast.success(i18n.t("toast.disbursementLinked"));
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.disbursementLinkFailed")),
  });
}

/** Staff xác nhận đã chi tiền (rule #3). */
export function useConfirmDisbursementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ConfirmDisbursementPayload }) =>
      disbursementService.confirm(id, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.disbursementConfirmed"));
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.actionFailed")),
  });
}

/** Sinh lại lịch giải ngân theo loại đề tài — lý do bắt buộc, ghi sổ quyết định. */
export function useRegenerateDisbursementsMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => disbursementService.regenerate(contractId, reason),
    onSuccess: (tranches) => {
      toast.success(i18n.t("toast.disbursementsGenerated", { n: tranches?.length ?? 0 }));
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.actionFailed")),
  });
}

/** Huỷ xác nhận "đã giải ngân" bấm nhầm — lý do bắt buộc. */
export function useUndoDisbursementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => disbursementService.undo(id, reason),
    onSuccess: () => {
      toast.success(i18n.t("toast.resultReopened"));
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.actionFailed")),
  });
}
