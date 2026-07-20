import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settlementService } from "@/services/api/settlement.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateSettlementPayload } from "@/types/settlement";

export function useSettlementQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.settlements.detail(contractId ?? ""),
    queryFn: () => settlementService.getByContract(contractId as string),
    enabled: Boolean(contractId),
    retry: false,
  });
}

function useSettlementAction<TArgs>(
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
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || errorMessage),
  });
}

export function useCreateSettlementMutation(contractId: string) {
  return useSettlementAction<CreateSettlementPayload>(
    contractId,
    (payload) => settlementService.create(contractId, payload),
    "Settlement created.",
    "Unable to create the settlement."
  );
}

export function useSignSettlementMutation(contractId: string) {
  return useSettlementAction<{ id: number; sideASigneeId: string }>(
    contractId,
    ({ id, sideASigneeId }) => settlementService.sign(id, sideASigneeId),
    "Settlement signed.",
    "Unable to sign the settlement."
  );
}

export function useMarkAccountingClearedMutation(contractId: string) {
  return useSettlementAction<{ id: number; clearedDate?: string }>(
    contractId,
    ({ id, clearedDate }) => settlementService.markAccountingCleared(id, clearedDate),
    "Accounting marked as cleared.",
    "Unable to mark accounting as cleared."
  );
}

export function useMarkAssetsClearedMutation(contractId: string) {
  return useSettlementAction<{ id: number; clearedDate?: string }>(
    contractId,
    ({ id, clearedDate }) => settlementService.markAssetsCleared(id, clearedDate),
    "Assets marked as cleared.",
    "Unable to mark assets as cleared."
  );
}
