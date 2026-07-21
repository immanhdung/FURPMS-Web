import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { minutesService } from "@/services/api/minutes.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SaveMinutesPayload } from "@/types/minutes";

export function useSaveMinutesMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveMinutesPayload) => minutesService.save(councilId, payload),
    onSuccess: () => {
      toast.success("Minutes submitted.");
      // Minutes and decision share the same backend record — refetch so the draft appears in the decision view.
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit minutes."),
  });
}
