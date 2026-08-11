import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { decisionService } from "@/services/api/decision.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SaveMinutesPayload } from "@/types/decision";

export function useDecisionQuery(councilId: string | null, projectId?: string) {
  return useQuery({
    queryKey: [...queryKeys.decision.detail(councilId ?? ""), projectId ?? ""],
    queryFn: () => decisionService.get(councilId as string, projectId),
    enabled: Boolean(councilId),
    retry: false,
  });
}

/** Thư ký lưu bản nháp biên bản (chưa đổi trạng thái đề tài). */
export function useSaveMinutesMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveMinutesPayload) => decisionService.saveMinutes(councilId, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.minutesSaved"));
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.minutesSaveFailed")),
  });
}

/** Chủ tịch duyệt & khóa biên bản — chỉ sau bước này đề tài mới đổi trạng thái (rule #12). */
export function useApproveMinutesMutation(councilId: string, projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => decisionService.approveMinutes(councilId, projectId),
    onSuccess: () => {
      toast.success(i18n.t("toast.minutesApproved"));
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
      // Trạng thái đề tài + vòng chấm đổi theo → làm mới danh sách liên quan.
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.minutesApproveFailed")),
  });
}
