import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CouncilSlotBoard, SlotEntry } from "@/types/council-slot";

export const councilSlotService = {
  list: (councilId: string) =>
    axiosClient.get<ApiResponse<CouncilSlotBoard>>(`/councils/${councilId}/slots`).then((res) => res.data.data),

  save: (councilId: string, entries: SlotEntry[]) =>
    axiosClient.put<ApiResponse<null>>(`/councils/${councilId}/slots`, { entries }).then((res) => res.data),
};
