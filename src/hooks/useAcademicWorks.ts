import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { academicWorkService } from "@/services/api/academic-work.service";
import { academicProfileKeys } from "@/hooks/useAcademicProfile";
import type { AcademicWorkPayload } from "@/types/academic-work";
import type { ApiError } from "@/types/common";

export const academicWorkKeys = {
  byUser: (userId: string) => ["academic-works", userId] as const,
};

export function useAcademicWorksQuery(userId: string | null) {
  return useQuery({
    queryKey: academicWorkKeys.byUser(userId ?? ""),
    queryFn: () => academicWorkService.list(userId as string),
    enabled: Boolean(userId),
  });
}

/**
 * Mọi thao tác ghi đều làm mới **cả hồ sơ**, không chỉ danh sách: máy chủ tính lại các ô đếm
 * (BM02 mục 14.1–14.5, 15, 19.1/19.3) sau mỗi lần thêm/sửa/xoá. Không làm mới hồ sơ thì con số
 * hiển thị vẫn là số cũ — đúng kiểu lệch mà việc suy ra số sinh ra để tránh.
 */
function useInvalidate(userId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: academicWorkKeys.byUser(userId) });
    queryClient.invalidateQueries({ queryKey: academicProfileKeys.byUser(userId) });
  };
}

export function useCreateAcademicWorkMutation(userId: string) {
  const { t } = useTranslation();
  const invalidate = useInvalidate(userId);

  return useMutation({
    mutationFn: (payload: AcademicWorkPayload) => academicWorkService.create(userId, payload),
    onSuccess: () => {
      toast.success(t("common.saved"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || t("common.error")),
  });
}

export function useUpdateAcademicWorkMutation(userId: string) {
  const { t } = useTranslation();
  const invalidate = useInvalidate(userId);

  return useMutation({
    mutationFn: ({ workId, payload }: { workId: string; payload: AcademicWorkPayload }) =>
      academicWorkService.update(userId, workId, payload),
    onSuccess: () => {
      toast.success(t("common.saved"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || t("common.error")),
  });
}

export function useDeleteAcademicWorkMutation(userId: string) {
  const { t } = useTranslation();
  const invalidate = useInvalidate(userId);

  return useMutation({
    mutationFn: (workId: string) => academicWorkService.remove(userId, workId),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || t("common.error")),
  });
}
