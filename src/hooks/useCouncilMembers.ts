import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { councilMemberService } from "@/services/api/council-member.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { AddCouncilMemberPayload, RespondMembershipPayload } from "@/types/council-member";

export function useCouncilMembersQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.councilMembers.list(councilId ?? ""),
    queryFn: () => councilMemberService.list(councilId as string),
    enabled: Boolean(councilId),
  });
}

export function useAddCouncilMemberMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCouncilMemberPayload) => councilMemberService.add(councilId, payload),
    onSuccess: () => {
      toast.success("Member added.");
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to add member."),
  });
}

export function useRespondMembershipMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: RespondMembershipPayload }) =>
      councilMemberService.respond(memberId, payload),
    onSuccess: () => {
      toast.success("Membership status updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update membership."),
  });
}

export function useRemoveCouncilMemberMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => councilMemberService.remove(memberId),
    onSuccess: () => {
      toast.success("Member removed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to remove member."),
  });
}
