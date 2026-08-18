import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { aiService } from "@/services/api/ai.service";
import type { ApiError } from "@/types/common";

export function useExtractProposalMutation() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (file: File) => aiService.extractFromFile(file),
    onError: (error: ApiError) => toast.error(error.message || t("wizard.step2.extractFailed")),
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

/** Khoá cache dùng chung để form chấm điểm đọc được gợi ý do nút AI ở trên sinh ra. */
export const scoreSuggestionKey = (councilId: string, proposalId: string) =>
  ["ai", "score-suggestion", councilId, proposalId] as const;

/**
 * Một lần bấm ra cả tóm tắt lẫn gợi ý điểm.
 *
 * Kết quả được **ghi thẳng vào cache** của hai truy vấn sẵn có, nên thẻ tóm tắt và form chấm
 * điểm — hai component nằm cách xa nhau trong cây — tự cập nhật mà không phải truyền props
 * xuyên qua mấy tầng ở giữa.
 */
export function useReviewKitMutation(councilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => aiService.reviewKit(councilId, proposalId),
    onSuccess: (kit, proposalId) => {
      if (kit.summary) queryClient.setQueryData(["ai", "summary", proposalId], kit.summary);
      queryClient.setQueryData(scoreSuggestionKey(councilId, proposalId), kit.suggestions);

      // Hỏng một phần thì nói rõ phần nào — phần còn lại vẫn hiện bình thường.
      if (kit.summaryError) toast.error(`Tóm tắt AI lỗi: ${kit.summaryError}`);
      if (kit.suggestionsError) toast.error(`Gợi ý điểm AI lỗi: ${kit.suggestionsError}`);
    },
    onError: () => toast.error("Không chạy được AI hỗ trợ chấm."),
  });
}

/**
 * Gợi ý điểm đã sinh — chỉ ĐỌC cache, không tự gọi Gemini.
 * Nguồn dữ liệu là nút AI gộp ở thẻ tóm tắt phía trên.
 */
export function useScoreSuggestionsQuery(councilId: string, proposalId: string | null) {
  return useQuery({
    queryKey: scoreSuggestionKey(councilId, proposalId ?? ""),
    queryFn: () => Promise.resolve([] as never[]),
    enabled: false,
  });
}
