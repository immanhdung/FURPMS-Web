import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success(`Generated ${tranches?.length ?? 0} disbursement tranches.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to generate the schedule."),
  });
}

/** Staff xác nhận đã chi tiền (rule #3). */
export function useConfirmDisbursementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ConfirmDisbursementPayload }) =>
      disbursementService.confirm(id, payload),
    onSuccess: () => {
      toast.success("Disbursement confirmed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to confirm the disbursement."),
  });
}
