import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financialConfigService } from "@/services/api/financial-config.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { FinancialConfigPayload } from "@/types/financial-config";

export function useFinancialConfigsQuery() {
  return useQuery({
    queryKey: queryKeys.financialConfigs.list(),
    queryFn: financialConfigService.list,
  });
}

export function useCreateFinancialConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinancialConfigPayload) => financialConfigService.create(payload),
    onSuccess: () => {
      toast.success("Financial configuration created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.financialConfigs.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create configuration."),
  });
}

export function useUpdateFinancialConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FinancialConfigPayload }) =>
      financialConfigService.update(id, payload),
    onSuccess: () => {
      toast.success("Financial configuration updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.financialConfigs.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update configuration."),
  });
}
