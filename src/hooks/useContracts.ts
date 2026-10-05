import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contractService } from "@/services/api/contract.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateContractPayload, UpdateContractPayload } from "@/types/contract";

export function useContractsQuery(mine = false) {
  return useQuery({
    queryKey: [...queryKeys.contracts.list(), mine ? "mine" : "all"],
    queryFn: () => contractService.list(mine),
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

export function useUpdateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContractPayload }) =>
      contractService.update(id, payload),
    onSuccess: (_data, { id }) => {
      toast.success("Contract updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update contract."),
  });
}

export function useDeleteContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contractService.remove(id),
    onSuccess: () => {
      toast.success("Contract deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    // BE trả 409 kèm lý do cụ thể ("đã có sản phẩm được nộp"…) — hiện nguyên văn,
    // đừng nuốt mất rồi thay bằng câu chung chung.
    onError: (error: ApiError) => toast.error(error.message || "Unable to delete contract."),
  });
}

export function useSignContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, signedOn }: { id: string; signedOn?: string }) => contractService.sign(id, signedOn),
    onSuccess: (_data, { id }) => {
      toast.success("Đã ghi nhận hợp đồng đã ký.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Không ghi nhận được hợp đồng đã ký."),
  });
}

export function useTerminateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => contractService.terminate(id, { reason }),
    onSuccess: (_data, { id }) => {
      toast.success("Đã ghi nhận chấm dứt hợp đồng.");
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Không thể chấm dứt hợp đồng."),
  });
}
