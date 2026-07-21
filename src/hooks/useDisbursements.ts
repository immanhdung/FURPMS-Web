import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { disbursementService } from "@/services/api/disbursement.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { ConfirmDisbursementPayload } from "@/types/disbursement";

export function useDisbursementsQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.disbursements.list(contractId ?? ""),
    queryFn: () => disbursementService.list(contractId as string),
    enabled: Boolean(contractId),
  });
}

export function useGenerateDisbursementsMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => disbursementService.generate(contractId),
    onSuccess: () => {
      toast.success("Disbursement installments generated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to generate disbursements."),
  });
}

export function useConfirmDisbursementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConfirmDisbursementPayload }) =>
      disbursementService.confirm(id, payload),
    onSuccess: () => {
      toast.success("Disbursement confirmed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to confirm disbursement."),
  });
}
