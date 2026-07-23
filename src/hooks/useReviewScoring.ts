import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewScoringService } from "@/services/api/review-scoring.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SubmitScorePayload } from "@/types/review-scoring";

export function useRubricTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.rubricTemplates.list(),
    queryFn: reviewScoringService.listRubrics,
  });
}

export function useMyScoreQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.scores.my(councilId ?? ""),
    queryFn: () => reviewScoringService.getMyScore(councilId as string),
    enabled: Boolean(councilId),
    retry: false,
  });
}

export function useAllScoresQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.scores.all(councilId ?? ""),
    queryFn: () => reviewScoringService.getAllScores(councilId as string),
    enabled: Boolean(councilId),
  });
}

export function useSubmitScoreMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitScorePayload) => reviewScoringService.submitScore(councilId, payload),
    onSuccess: () => {
      toast.success("Score submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.scores.my(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit score."),
  });
}
