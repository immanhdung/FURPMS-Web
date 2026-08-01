import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { councilSlotService } from "@/services/api/council-slot.service";
import type { ApiError } from "@/types/common";
import type { SlotEntry } from "@/types/council-slot";

const key = (councilId: string) => ["council-slots", councilId] as const;

export function useCouncilSlotsQuery(councilId: string) {
  return useQuery({
    queryKey: key(councilId),
    queryFn: () => councilSlotService.list(councilId),
    enabled: Boolean(councilId),
  });
}

export function useSaveSlotsMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: SlotEntry[]) => councilSlotService.save(councilId, entries),
    onSuccess: () => {
      toast.success(i18n.t("toast.slotsSaved"));
      queryClient.invalidateQueries({ queryKey: key(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.slotsFailed")),
  });
}
