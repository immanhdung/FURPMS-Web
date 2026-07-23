import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contractService } from "@/services/api/contract.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateContractPayload } from "@/types/contract";

export function useContractsQuery() {
  return useQuery({
    queryKey: queryKeys.contracts.list(),
    queryFn: contractService.list,
  });
}

export function useContractQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(id ?? ""),
    queryFn: () => contractService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContractPayload) => contractService.create(payload),
    onSuccess: () => {
      toast.success("Contract created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create contract."),
  });
}

export function useSignContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contractService.sign(id),
    onSuccess: (_data, id) => {
      toast.success("Contract signed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to sign contract."),
  });
}
