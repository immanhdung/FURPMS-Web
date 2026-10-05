import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { councilService } from "@/services/api/council.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import i18n from "@/i18n";
import type {
  CouncilQuery,
  CreateCouncilPayload,
  SendInvitationsPayload,
  UpdateCouncilPayload,
} from "@/types/council";

export function useCreateCouncilMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouncilPayload) => councilService.create(payload),
    onSuccess: () => {
      toast.success(i18n.t("council.created"));
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}

export function useSendInvitationsMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInvitationsPayload) => councilService.sendInvitations(councilId, payload),
    onSuccess: () => {
      toast.success(i18n.t("council.invitationsSent"));
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}

/** Khoá cache danh sách hội đồng — đổi bộ lọc là đổi khoá, nên không lẫn kết quả giữa các bộ lọc. */
export const councilKeys = {
  list: (query: CouncilQuery) => ["councils", "list", query] as const,
  detail: (id: string) => ["councils", "detail", id] as const,
};

export function useCouncilsQuery(query: CouncilQuery = {}) {
  return useQuery({
    queryKey: councilKeys.list(query),
    queryFn: () => councilService.list(query),
  });
}

export function useCouncilQuery(councilId: string | null) {
  return useQuery({
    queryKey: councilKeys.detail(councilId ?? ""),
    queryFn: () => councilService.getById(councilId as string),
    enabled: Boolean(councilId),
  });
}

/**
 * Mọi thao tác ghi đều làm mới CẢ danh sách: số thành viên, vai trò, lịch họp đều ảnh hưởng tới
 * cột "còn thiếu gì để gửi thư mời" — không làm mới thì bảng vẫn báo thiếu dù đã bổ sung xong.
 */
function useInvalidateCouncils() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["councils"] });
}

export function useUpdateCouncilMutation(councilId: string) {
  const invalidate = useInvalidateCouncils();
  return useMutation({
    mutationFn: (payload: UpdateCouncilPayload) => councilService.update(councilId, payload),
    onSuccess: () => {
      toast.success(i18n.t("common.saved"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}

export function useUpdateMemberRoleMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, memberRole }: { memberId: string; memberRole: string }) =>
      councilService.updateMemberRole(memberId, memberRole),
    onSuccess: () => {
      toast.success(i18n.t("council.roleChanged"));
      queryClient.invalidateQueries({ queryKey: ["councils"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.councilMembers.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}

export function useDeleteCouncilMutation() {
  const invalidate = useInvalidateCouncils();
  return useMutation({
    mutationFn: (councilId: string) => councilService.remove(councilId),
    onSuccess: () => {
      toast.success(i18n.t("common.deleted"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("common.error")),
  });
}
