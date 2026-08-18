import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { systemSettingService } from "@/services/api/system-setting.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";

/** Admin only — trả 403 với vai trò khác, nên chỉ gọi khi chắc chắn là Admin. */
/**
 * Bước nhảy điểm cho màn chấm. KHÔNG dùng useSystemSettingsQuery ở đây: endpoint đó chỉ cho
 * Admin nên hội đồng luôn ăn 403, im lặng rơi về mặc định số nguyên — cấu hình cho phép thập
 * phân của Admin sẽ không bao giờ có tác dụng với đúng người cần nó.
 */
export function useScoringPolicyQuery() {
  return useQuery({
    queryKey: ["system-settings", "scoring-policy"],
    queryFn: systemSettingService.scoringPolicy,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCouncilPolicyQuery() {
  return useQuery({
    queryKey: ["system-settings", "council-policy"],
    queryFn: systemSettingService.councilPolicy,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSystemSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.systemSettings.list(),
    queryFn: systemSettingService.list,
    enabled,
  });
}

/** Giới hạn upload — dùng ở mọi form đính kèm file để chặn sớm phía client. */
export function useUploadPolicyQuery() {
  return useQuery({
    queryKey: queryKeys.systemSettings.uploadPolicy(),
    queryFn: systemSettingService.uploadPolicy,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSystemSettingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => systemSettingService.update(key, value),
    onSuccess: () => {
      toast.success("Setting updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update the setting."),
  });
}
