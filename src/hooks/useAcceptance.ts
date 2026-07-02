import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { acceptanceService } from "@/services/api/acceptance.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { AcceptancePayload } from "@/types/acceptance";

export function useAcceptanceQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.acceptance.detail(councilId ?? ""),
    queryFn: () => acceptanceService.get(councilId as string),
    enabled: Boolean(councilId),
    retry: false,
  });
}

export function useSubmitAcceptanceMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AcceptancePayload) => acceptanceService.submit(councilId, payload),
    onSuccess: () => {
      toast.success("Acceptance evaluation submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.acceptance.detail(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit acceptance evaluation."),
  });
}
