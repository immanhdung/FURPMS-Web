import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { researchOrderService, type ResearchOrderListParams } from "@/services/api/research-order.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateResearchOrderPayload } from "@/types/research-order";

export function useResearchOrdersQuery(params?: ResearchOrderListParams) {
  return useQuery({
    queryKey: queryKeys.researchOrders.list(params as Record<string, unknown> | undefined),
    queryFn: () => researchOrderService.list(params),
  });
}

export function useResearchOrderQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.researchOrders.detail(id ?? 0),
    queryFn: () => researchOrderService.getById(id as number),
    enabled: id !== null,
  });
}

export function useCreateResearchOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateResearchOrderPayload) => researchOrderService.create(payload),
    onSuccess: () => {
      toast.success("Research order created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.researchOrders.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create research order."),
  });
}
