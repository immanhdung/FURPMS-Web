import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { membershipService } from "@/services/api/membership.service";
import { councilMemberService } from "@/services/api/council-member.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { RespondMembershipPayload } from "@/types/council-member";

export function useMyMembershipsQuery() {
  return useQuery({
    queryKey: queryKeys.memberships.mine(),
    queryFn: membershipService.mine,
  });
}

export function useRespondToInvitationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: RespondMembershipPayload }) =>
      councilMemberService.respond(memberId, payload),
    onSuccess: (_data, variables) => {
      toast.success(variables.payload.accept ? "Invitation accepted." : "Invitation declined.");
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.mine() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to respond to invitation."),
  });
}
