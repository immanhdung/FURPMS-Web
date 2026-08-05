import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiService } from "@/services/api/ai.service";

export function useExtractProposalMutation() {
  return useMutation({
    mutationFn: (file: File) => aiService.extractFromFile(file),
    onError: () => toast.error("AI extraction failed. Please fill in the details manually."),
  });
}

export function useSimilarityCheckMutation() {
  return useMutation({
    mutationFn: ({ file, topicId }: { file: File; topicId: number }) => aiService.checkSimilarity(file, topicId),
    onError: () => toast.error("Unable to run the similarity check."),
  });
}

export function useSummarizeProposalMutation() {
  return useMutation({
    mutationFn: (proposalId: string) => aiService.summarizeProposal(proposalId),
  });
}

/**
 * Tóm tắt AI đã sinh trước đó — đọc cache `llm_outputs`, KHÔNG gọi Gemini.
 * Nhờ vậy reviewer mở màn chấm là thấy ngay tóm tắt Staff/PI đã tạo, không tốn quota.
 */
export function useProposalSummaryQuery(proposalId: string | null) {
  return useQuery({
    queryKey: ["ai", "summary", proposalId ?? ""],
    queryFn: () => aiService.getProposalSummary(proposalId as string),
    enabled: Boolean(proposalId),
    // TanStack Query v5 BỎ `onError` trên useQuery. Để lại thì không khớp overload nào,
    // kiểu dữ liệu trả về suy ra `{}` — mọi field của tóm tắt thành lỗi kiểu ở nơi dùng.
    // Lỗi khi đọc cache cũng không cần toast: chưa có tóm tắt là chuyện bình thường.
  });
}

export function useSemanticSearchMutation() {
  return useMutation({
    mutationFn: (query: string) => aiService.semanticSearch(query),
    onError: () => toast.error("Unable to run semantic search."),
  });
}

export function useSuggestReviewersMutation() {
  return useMutation({
    mutationFn: (trackId: string) => aiService.suggestReviewers(trackId),
    onError: () => toast.error("Unable to generate reviewer suggestions."),
  });
}

export function useGenerateFeedbackMutation() {
  return useMutation({
    mutationFn: (proposalId: string) => aiService.generateFeedback(proposalId),
  });
}

/** Đối chiếu form ↔ file đề cương (thầy 29/07). */
export function useCheckConsistencyMutation() {
  return useMutation({
    mutationFn: (proposalId: string) => aiService.checkConsistency(proposalId),
  });
}

/** AI gợi ý điểm theo từng tiêu chí — người chấm vẫn quyết định cuối (rule #12). */
export function useSuggestScoresMutation(councilId: string) {
  return useMutation({
    mutationFn: (proposalId: string) => aiService.suggestScores(councilId, proposalId),
    onError: () => toast.error("Unable to generate AI feedback."),
  });
}
