import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { DecisionResponse } from "@/types/decision";

export const decisionService = {
  get: (councilId: string) =>
    axiosClient
      .get<ApiResponse<DecisionResponse | null>>(`/review-scoring/councils/${councilId}/decision`)
      .then((res) => res.data.data),
};
