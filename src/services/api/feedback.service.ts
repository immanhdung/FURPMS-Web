import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { FeedbackPayload, FeedbackResponse } from "@/types/feedback";

export const feedbackService = {
  list: (councilId: string) =>
    axiosClient.get<ApiResponse<FeedbackResponse[]>>(`/councils/${councilId}/feedback`).then((res) => res.data.data),

  submit: (councilId: string, payload: FeedbackPayload) =>
    axiosClient
      .post<ApiResponse<FeedbackResponse>>(`/councils/${councilId}/feedback`, payload)
      .then((res) => res.data.data),
};
