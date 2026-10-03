import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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

/** Thành viên nhận / từ chối RIÊNG một đề tài được giao thêm (03/10). */
export function useRespondProjectInvitationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      projectId,
      payload,
    }: {
      memberId: string;
      projectId: string;
      payload: RespondMembershipPayload;
    }) => councilMemberService.respondProject(memberId, projectId, payload),
    onSuccess: (_d, v) => {
      toast.success(i18n.t(v.payload.accept ? "projectInvite.acceptedToast" : "projectInvite.declinedToast"));
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.mine() });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.actionFailed")),
  });
}
