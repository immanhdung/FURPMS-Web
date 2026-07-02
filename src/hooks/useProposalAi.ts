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
