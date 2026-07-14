import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewRoundService } from "@/services/api/review-round.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CloseRoundPayload, CreateReviewRoundPayload } from "@/types/review-round";

export function useReviewRoundsQuery(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.reviewRounds.list(proposalId ?? ""),
    queryFn: () => reviewRoundService.list(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

export function useCreateReviewRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewRoundPayload) => reviewRoundService.create(proposalId, payload),
    onSuccess: () => {
      toast.success("Review round created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create review round."),
  });
}

export function useOpenRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: string) => reviewRoundService.open(roundId),
    onSuccess: () => {
      toast.success("Round opened.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to open round."),
  });
}

export function useCloseRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: CloseRoundPayload }) =>
      reviewRoundService.close(roundId, payload),
    onSuccess: () => {
      toast.success("Round closed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to close round."),
  });
}
