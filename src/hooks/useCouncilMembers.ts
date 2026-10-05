import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
      toast.success(i18n.t("common.saved"));
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}

/**
 * Chuyên viên ghi nhận trả lời thư mời THAY thành viên — dùng cho CẢ xác nhận lẫn từ chối.
 * Máy chủ ghi lại ai đã bấm hộ, và chịu công tắc `COUNCIL_ALLOW_RESPOND_ON_BEHALF`.
 */
export function useRespondOnBehalfMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, accept, declineReason }: { memberId: string; accept: boolean; declineReason?: string }) =>
      councilMemberService.respondOnBehalf(memberId, { accept, declineReason }),
    onSuccess: (_data, vars) => {
      toast.success(i18n.t(vars.accept ? "toast.memberConfirmedOnBehalf" : "toast.memberDeclinedOnBehalf"));
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
      // Danh sách hội đồng có cột "còn thiếu gì" phụ thuộc số người đã xác nhận.
      queryClient.invalidateQueries({ queryKey: ["councils"] });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.confirmOnBehalfFailed")),
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
