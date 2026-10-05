import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { BallotTally } from "@/types/ballot-tally";
import type { RubricTemplate, ScoreResponse, SubmitScorePayload } from "@/types/review-scoring";

export const reviewScoringService = {
  listRubrics: () =>
    axiosClient.get<ApiResponse<RubricTemplate[]>>("/review-scoring/rubrics").then((res) => res.data.data),

  getRubric: (id: number) =>
    axiosClient.get<ApiResponse<RubricTemplate>>(`/review-scoring/rubrics/${id}`).then((res) => res.data.data),

  // MỌI lời gọi đều phải kèm projectId: một hội đồng chấm NHIỀU đề tài (rule tuần 10 — slot con
  // theo từng đề tài). Thiếu nó thì máy chủ đoán đề tài nào ghi trước, và màn đang chấm đề tài B
  // lại hiện phiếu/biên bản của đề tài A.
  submitScore: (councilId: string, payload: SubmitScorePayload) =>
    axiosClient
      .post<ApiResponse<ScoreResponse>>(`/review-scoring/councils/${councilId}/scores`, payload)
      .then((res) => res.data.data),

  getMyScore: (councilId: string, projectId?: string) =>
    axiosClient
      .get<ApiResponse<ScoreResponse | null>>(`/review-scoring/councils/${councilId}/scores/my`, {
        params: projectId ? { projectId } : undefined,
      })
      .then((res) => res.data.data),

  /** BM12 mục 10.1 — phiếu của từng thành viên + số liệu tổng hợp. */
  ballotTally: (councilId: string, projectId?: string) =>
    axiosClient
      .get<ApiResponse<BallotTally>>(`/review-scoring/councils/${councilId}/ballot-tally`, {
        params: projectId ? { projectId } : undefined,
      })
      .then((res) => res.data.data),

  getAllScores: (councilId: string, projectId?: string) =>
    axiosClient
      .get<ApiResponse<ScoreResponse[]>>(`/review-scoring/councils/${councilId}/scores`, {
        params: projectId ? { projectId } : undefined,
      })
      .then((res) => res.data.data),
};
