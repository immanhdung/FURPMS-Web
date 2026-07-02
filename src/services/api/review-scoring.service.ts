import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { RubricTemplate, ScoreResponse, SubmitScorePayload } from "@/types/review-scoring";

export const reviewScoringService = {
  listRubrics: () =>
    axiosClient.get<ApiResponse<RubricTemplate[]>>("/review-scoring/rubrics").then((res) => res.data.data),

  getRubric: (id: number) =>
    axiosClient.get<ApiResponse<RubricTemplate>>(`/review-scoring/rubrics/${id}`).then((res) => res.data.data),

  submitScore: (councilId: string, payload: SubmitScorePayload) =>
    axiosClient
      .post<ApiResponse<ScoreResponse>>(`/review-scoring/councils/${councilId}/scores`, payload)
      .then((res) => res.data.data),

  getMyScore: (councilId: string) =>
    axiosClient
      .get<ApiResponse<ScoreResponse | null>>(`/review-scoring/councils/${councilId}/scores/my`)
      .then((res) => res.data.data),
};
