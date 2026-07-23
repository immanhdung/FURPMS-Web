import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeRequestService } from "@/services/api/change-request.service";
import type { ApiError } from "@/types/common";
import type { CreateChangeRequestPayload, ReviewChangeRequestPayload } from "@/types/change-request";

export const changeRequestKeys = {
  all: ["change-requests"] as const,
  byProposal: (proposalId: string) => ["change-requests", "proposal", proposalId] as const,
  pending: () => ["change-requests", "pending"] as const,
};

export function useChangeRequestsByProposalQuery(proposalId: string | null) {
  return useQuery({
    queryKey: changeRequestKeys.byProposal(proposalId ?? ""),
    queryFn: () => changeRequestService.listByProposal(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

export function usePendingChangeRequestsQuery() {
  return useQuery({
    queryKey: changeRequestKeys.pending(),
    queryFn: changeRequestService.listPending,
  });
}

export function useCreateChangeRequestMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChangeRequestPayload) =>
      changeRequestService.create(proposalId, payload),
    onSuccess: () => {
      toast.success("Change request submitted.");
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.byProposal(proposalId) });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to submit change request.");
    },
  });
}

export function useReviewChangeRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewChangeRequestPayload }) =>
      changeRequestService.review(id, payload),
    onSuccess: () => {
      toast.success("Change request reviewed.");
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to review change request.");
    },
  });
}
