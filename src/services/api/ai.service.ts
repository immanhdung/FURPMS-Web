import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";
import type { AiFeedbackItem, ReviewerSuggestion, SemanticSearchResult, SummaryResult } from "@/types/ai-tools";

export const aiService = {
  extractFromFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post<ApiResponse<AiExtractionResult>>("/ai/extract", formData)
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
};
