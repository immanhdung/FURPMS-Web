import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settlementService } from "@/services/api/settlement.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateSettlementPayload, SignSettlementPayload } from "@/types/settlement";

export function useSettlementQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.settlements.detail(contractId ?? ""),
    queryFn: () => settlementService.get(contractId as string),
    enabled: Boolean(contractId),
    retry: false,
  });
}

export function useCreateSettlementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSettlementPayload) => settlementService.create(contractId, payload),
    onSuccess: () => {
      toast.success("Settlement created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create settlement."),
  });
}

export function useSignSettlementMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SignSettlementPayload }) =>
      settlementService.sign(id, payload),
    onSuccess: () => {
      toast.success("Settlement signed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to sign settlement."),
  });
}

export function useMarkAccountingClearedMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementService.markAccountingCleared(id),
    onSuccess: () => {
      toast.success("Accounting marked as cleared.");
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to mark accounting cleared."),
  });
}

export function useMarkAssetsClearedMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementService.markAssetsCleared(id),
    onSuccess: () => {
      toast.success("Assets marked as cleared.");
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to mark assets cleared."),
  });
}
