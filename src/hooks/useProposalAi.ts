import { useMutation } from "@tanstack/react-query";
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
    onError: () => toast.error("Unable to generate an AI summary."),
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
    onError: () => toast.error("Unable to generate AI feedback."),
  });
}
