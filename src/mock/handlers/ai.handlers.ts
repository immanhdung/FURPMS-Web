import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { SAMPLE_AI_EXTRACTIONS } from "@/mock/data/ai-extractions";
import type { ApiResponse } from "@/types/common";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";

export const aiHandlers = [
  http.post(`${API_BASE_URL}/ai/extract`, async () => {
    await delay(1300);
    const result = SAMPLE_AI_EXTRACTIONS[Math.floor(Math.random() * SAMPLE_AI_EXTRACTIONS.length)];
    const response: ApiResponse<AiExtractionResult> = { success: true, data: result };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/ai/similarity-check`, async () => {
    await delay(1100);
    const score = Math.floor(Math.random() * 71) + 25;
    const result: SimilarityCheckResult = { score, passed: score >= 60 };
    const response: ApiResponse<SimilarityCheckResult> = { success: true, data: result };
    return HttpResponse.json(response);
  }),
];
