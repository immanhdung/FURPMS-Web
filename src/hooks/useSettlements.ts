import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
  errorMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.detail(contractId) });
      // Ký BM13 đổi trạng thái hợp đồng sang SETTLED; nạp lại cả header và danh sách.
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || errorMessage),
  });
}

export function useCreateSettlementMutation(contractId: string) {
  return useSettlementAction<CreateSettlementPayload>(
    contractId,
    (payload) => settlementService.create(contractId, payload),
    i18n.t("toast.settlementCreated"),
    i18n.t("toast.settlementCreateFailed"),
  );
}

export function useSignSettlementMutation(contractId: string) {
  return useSettlementAction<{ id: number; sideASigneeId: string }>(
    contractId,
    ({ id, sideASigneeId }) => settlementService.sign(id, sideASigneeId),
    i18n.t("toast.settlementSigned"),
    i18n.t("toast.settlementSignFailed"),
  );
}

export function useMarkAccountingClearedMutation(contractId: string) {
  return useSettlementAction<{ id: number; clearedDate?: string }>(
    contractId,
    ({ id, clearedDate }) => settlementService.markAccountingCleared(id, clearedDate),
    i18n.t("toast.accountingCleared"),
    i18n.t("toast.actionFailed"),
  );
}

export function useMarkAssetsClearedMutation(contractId: string) {
  return useSettlementAction<{ id: number; clearedDate?: string }>(
    contractId,
    ({ id, clearedDate }) => settlementService.markAssetsCleared(id, clearedDate),
    i18n.t("toast.assetsCleared"),
    i18n.t("toast.actionFailed"),
  );
}

export function useUpdateSettlementMutation(contractId: string) {
  return useSettlementAction<{ id: number; payload: CreateSettlementPayload }>(
    contractId,
    ({ id, payload }) => settlementService.update(id, payload),
    i18n.t("toast.settlementUpdated"),
    i18n.t("toast.actionFailed"),
  );
}

export function useDeleteSettlementMutation(contractId: string) {
  return useSettlementAction<{ id: number; reason: string }>(
    contractId,
    ({ id, reason }) => settlementService.delete(id, reason),
    i18n.t("toast.settlementDeleted"),
    i18n.t("toast.actionFailed"),
  );
}

export function useUnsignSettlementMutation(contractId: string) {
  return useSettlementAction<{ id: number; reason: string }>(
    contractId,
    ({ id, reason }) => settlementService.unsign(id, reason),
    i18n.t("toast.settlementUnsigned"),
    i18n.t("toast.actionFailed"),
  );
}
