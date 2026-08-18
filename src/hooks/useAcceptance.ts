import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { acceptanceService } from "@/services/api/acceptance.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { AcceptancePayload } from "@/types/acceptance";

export function useAcceptanceQuery(councilId: string | null, projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.acceptance.detail(councilId ?? "", projectId ?? ""),
    queryFn: () => acceptanceService.get(councilId as string, projectId as string),
    enabled: Boolean(councilId && projectId),
    retry: false,
  });
}

export function useSubmitAcceptanceMutation(councilId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AcceptancePayload) => acceptanceService.submit(councilId, payload),
    onSuccess: () => {
      toast.success("Acceptance evaluation submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.acceptance.detail(councilId, projectId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit acceptance evaluation."),
  });
}
