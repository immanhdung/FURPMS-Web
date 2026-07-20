import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { minutesService } from "@/services/api/minutes.service";
import type { ApiError } from "@/types/common";
import type { SaveMinutesPayload } from "@/types/minutes";

export function useSaveMinutesMutation(councilId: string) {
  return useMutation({
    mutationFn: (payload: SaveMinutesPayload) => minutesService.save(councilId, payload),
    onSuccess: () => toast.success("Minutes submitted."),
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit minutes."),
  });
}
