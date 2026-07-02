import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { councilService } from "@/services/api/council.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateCouncilPayload, SendInvitationsPayload } from "@/types/council";

export function useCreateCouncilMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouncilPayload) => councilService.create(payload),
    onSuccess: () => {
      toast.success("Council created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create council."),
  });
}

export function useSendInvitationsMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInvitationsPayload) => councilService.sendInvitations(councilId, payload),
    onSuccess: () => {
      toast.success("Invitations sent.");
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to send invitations."),
  });
}
