import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { SAMPLE_AI_EXTRACTIONS } from "@/mock/data/ai-extractions";
import { SAMPLE_FEEDBACK, SAMPLE_SEARCH_RESULTS, SAMPLE_SUMMARIES, getReviewerSuggestions } from "@/mock/data/ai-tools";
import type { ApiResponse } from "@/types/common";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";
import type { AiFeedbackItem, ReviewerSuggestion, SemanticSearchResult, SummaryResult } from "@/types/ai-tools";

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

  http.post(`${API_BASE_URL}/ai/search`, async ({ request }) => {
    await delay(900);
    const body = (await request.json()) as { query?: string };
    const query = (body.query ?? "").toLowerCase();
    const results = query
      ? SAMPLE_SEARCH_RESULTS.filter(
          (item) => item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query)
        )
      : SAMPLE_SEARCH_RESULTS;
    const response: ApiResponse<SemanticSearchResult[]> = {
      success: true,
      data: results.length > 0 ? results : SAMPLE_SEARCH_RESULTS,
    };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/ai/suggest-reviewers`, async () => {
    await delay(1200);
    const response: ApiResponse<ReviewerSuggestion[]> = { success: true, data: getReviewerSuggestions() };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/ai/proposals/:proposalId/feedback`, async () => {
    await delay(1300);
    const response: ApiResponse<AiFeedbackItem[]> = { success: true, data: SAMPLE_FEEDBACK };
    return HttpResponse.json(response);
  }),
];

const summaryStore = new Map<string, SummaryResult>();

export const aiSummaryHandlers = [
  http.post(`${API_BASE_URL}/proposals/:proposalId/generate-summary`, async ({ params }) => {
    await delay(1400);
    const result = SAMPLE_SUMMARIES[Math.floor(Math.random() * SAMPLE_SUMMARIES.length)];
    summaryStore.set(params.proposalId as string, result);
    const response: ApiResponse<SummaryResult> = { success: true, data: result };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/proposals/:proposalId/summary`, async ({ params }) => {
    await delay(300);
    const result = summaryStore.get(params.proposalId as string);
    if (!result) {
      return HttpResponse.json<ApiResponse<null>>({ success: false, message: "Not found", data: null }, { status: 404 });
    }
    const response: ApiResponse<SummaryResult> = { success: true, data: result };
    return HttpResponse.json(response);
  }),
];
