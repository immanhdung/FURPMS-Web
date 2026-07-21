import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { FeedbackResponse } from "@/types/feedback";

export const feedbackService = {
  list: (councilId: string) =>
    axiosClient.get<ApiResponse<FeedbackResponse[]>>(`/councils/${councilId}/feedback`).then((res) => res.data.data),
};
