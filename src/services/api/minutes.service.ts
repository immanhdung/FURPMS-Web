import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { SaveMinutesPayload } from "@/types/minutes";

export const minutesService = {
  save: (councilId: string, payload: SaveMinutesPayload) =>
    axiosClient
      .post<ApiResponse<null>>(`/review-scoring/councils/${councilId}/minutes`, payload)
      .then((res) => res.data),
};
