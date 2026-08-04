import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";
import type {
  AiConsistencyResult,
  AiFeedbackItem,
  AiScoreSuggestion,
  ReviewerSuggestion,
  SemanticSearchResult,
  SummaryResult,
} from "@/types/ai-tools";

export const aiService = {
  extractFromFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // BE đặt endpoint ở /proposals/extract (ProposalsController), KHÔNG phải /ai/extract.
    // Trước đây gọi sai đường dẫn ⇒ nút "trích xuất bằng AI" ở wizard luôn 404,
    // tức Đường B (upload + AI, rule #10/#20) chưa từng chạy.
    return axiosClient
      .post<ApiResponse<AiExtractionResult>>("/proposals/extract", formData)
      .then((res) => res.data.data);
  },

  checkSimilarity: (file: File, topicId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("topicId", String(topicId));
    return axiosClient
      .post<ApiResponse<SimilarityCheckResult>>("/ai/similarity-check", formData)
      .then((res) => res.data.data);
  },

  summarizeProposal: (proposalId: string) =>
    axiosClient
      .post<ApiResponse<SummaryResult>>(`/proposals/${proposalId}/generate-summary`)
      .then((res) => res.data.data),

  getProposalSummary: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<SummaryResult>>(`/proposals/${proposalId}/summary`)
      .then((res) => res.data.data),

  semanticSearch: (query: string) =>
    axiosClient
      .post<ApiResponse<SemanticSearchResult[]>>("/ai/search", { query })
      .then((res) => res.data.data),

  suggestReviewers: (trackId: string) =>
    axiosClient
      .post<ApiResponse<ReviewerSuggestion[]>>("/ai/suggest-reviewers", { trackId })
      .then((res) => res.data.data),

  generateFeedback: (proposalId: string) =>
    axiosClient
      .post<ApiResponse<AiFeedbackItem[]>>(`/ai/proposals/${proposalId}/feedback`)
      .then((res) => res.data.data),

  /** Góp ý đã sinh trước đó — không tốn quota Gemini. */
  getFeedback: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<AiFeedbackItem[] | null>>(`/ai/proposals/${proposalId}/feedback`)
      .then((res) => res.data.data),

  /** Đối chiếu thông tin đã điền với file đề cương đính kèm — chỉ ra chỗ thiếu/lệch. */
  checkConsistency: (proposalId: string) =>
    axiosClient
      .post<ApiResponse<AiConsistencyResult>>(`/ai/proposals/${proposalId}/consistency-check`)
      .then((res) => res.data.data),

  /** AI gợi ý điểm theo từng tiêu chí của bộ tiêu chí đang áp cho hội đồng. */
  suggestScores: (councilId: string, proposalId: string) =>
    axiosClient
      .post<ApiResponse<AiScoreSuggestion[]>>(
        `/ai/councils/${councilId}/proposals/${proposalId}/score-suggestion`,
      )
      .then((res) => res.data.data),
};
