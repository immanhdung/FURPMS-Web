import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { decisionService } from "@/services/api/decision.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { FinalizeDecisionPayload } from "@/types/decision";

export function useDecisionQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.decision.detail(councilId ?? ""),
    queryFn: () => decisionService.get(councilId as string),
    enabled: Boolean(councilId),
    retry: false,
  });
}

export function useFinalizeDecisionMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinalizeDecisionPayload) => decisionService.finalize(councilId, payload),
    onSuccess: () => {
      toast.success("Decision finalized.");
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to finalize decision."),
  });
}
