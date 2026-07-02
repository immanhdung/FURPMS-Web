import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";

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
};
