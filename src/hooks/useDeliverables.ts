import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { EvaluateDeliverablePayload, SubmitDeliverablePayload } from "@/types/deliverable";

export function useDeliverablesQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.deliverables.list(contractId ?? ""),
    queryFn: () => deliverableService.listByContract(contractId as string),
    enabled: Boolean(contractId),
  });
}

export function useSubmitDeliverableMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubmitDeliverablePayload }) =>
      deliverableService.submit(id, payload),
    onSuccess: () => {
      toast.success("Deliverable submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit the deliverable."),
  });
}

export function useEvaluateDeliverableMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EvaluateDeliverablePayload }) =>
      deliverableService.evaluate(id, payload),
    onSuccess: () => {
      toast.success("Deliverable evaluated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables.list(contractId) });
      // Nghiệm thu ĐẠT có thể bật cờ đủ điều kiện chi tiền → làm mới lịch giải ngân.
      queryClient.invalidateQueries({ queryKey: queryKeys.disbursements.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to evaluate the deliverable."),
  });
}
