import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { decisionService } from "@/services/api/decision.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SaveMinutesPayload } from "@/types/decision";

export function useDecisionQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.decision.detail(councilId ?? ""),
    queryFn: () => decisionService.get(councilId as string),
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
      toast.success("Minutes saved as a draft.");
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to save the minutes."),
  });
}

/** Chủ tịch duyệt & khóa biên bản — chỉ sau bước này đề tài mới đổi trạng thái (rule #12). */
export function useApproveMinutesMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => decisionService.approveMinutes(councilId),
    onSuccess: () => {
      toast.success("Minutes approved and locked. The proposal status has been updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.decision.detail(councilId) });
      // Trạng thái đề tài + vòng chấm đổi theo → làm mới danh sách liên quan.
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to approve the minutes."),
  });
}
