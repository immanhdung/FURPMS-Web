import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { reviewScoringService } from "@/services/api/review-scoring.service";
import type { BallotTally } from "@/types/ballot-tally";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SubmitScorePayload } from "@/types/review-scoring";

export function useRubricTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.rubricTemplates.list(),
    queryFn: reviewScoringService.listRubrics,
  });
}

// projectId nằm trong khoá cache: cùng một hội đồng nhưng khác đề tài là khác dữ liệu hoàn toàn.
export function useMyScoreQuery(councilId: string | null, projectId?: string) {
  return useQuery({
    queryKey: [...queryKeys.scores.my(councilId ?? ""), projectId ?? ""],
    queryFn: () => reviewScoringService.getMyScore(councilId as string, projectId),
    enabled: Boolean(councilId),
    retry: false,
  });
}

export function useAllScoresQuery(councilId: string | null, projectId?: string) {
  return useQuery({
    queryKey: [...queryKeys.scores.all(councilId ?? ""), projectId ?? ""],
    queryFn: () => reviewScoringService.getAllScores(councilId as string, projectId),
    enabled: Boolean(councilId),
  });
}

export function useSubmitScoreMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitScorePayload) => reviewScoringService.submitScore(councilId, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.scoreSubmitted"));
      queryClient.invalidateQueries({ queryKey: queryKeys.scores.my(councilId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scores.all(councilId) });
      queryClient.invalidateQueries({ queryKey: ["review-scoring", "ballot-tally"] });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.scoreSubmitFailed")),
  });
}

/** BM12 mục 10.1 — kết quả bỏ phiếu chi tiết từng thành viên (dùng ở màn biên bản). */
export function useBallotTallyQuery(councilId: string | null, projectId?: string) {
  return useQuery<BallotTally>({
    queryKey: ["review-scoring", "ballot-tally", councilId ?? "", projectId ?? ""],
    queryFn: () => reviewScoringService.ballotTally(councilId as string, projectId),
    enabled: Boolean(councilId),
  });
}
