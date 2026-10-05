import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { contractIdentityService } from "@/services/api/contract-identity.service";
import type { ApiError } from "@/types/common";
import type { ContractIdentityPayload } from "@/types/contract-identity";

export const contractIdentityKeys = {
  me: ["contract-identity", "me"] as const,
};

export function useContractIdentityQuery() {
  return useQuery({
    queryKey: contractIdentityKeys.me,
    queryFn: () => contractIdentityService.get(),
  });
}

export function useUpdateContractIdentityMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: ContractIdentityPayload) => contractIdentityService.update(payload),
    onSuccess: () => {
      toast.success(t("contractIdentity.saved"));
      queryClient.invalidateQueries({ queryKey: contractIdentityKeys.me });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || t("contractIdentity.saveFailed"));
    },
  });
}
