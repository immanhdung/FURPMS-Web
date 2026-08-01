import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { rubricTemplateService } from "@/services/api/rubric-template.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { SaveScopesPayload, UpdateTemplatePayload } from "@/types/rubric-template";

export function useRubricTemplatesFullQuery() {
  return useQuery({
    queryKey: queryKeys.rubricTemplates.full(),
    queryFn: rubricTemplateService.list,
  });
}

/** Bộ tiêu chí áp dụng cho (đợt, lĩnh vực, loại vòng) — form chấm điểm dùng cái này. */
export function useResolvedRubricQuery(cycleId?: number, trackId?: number, templateType?: string) {
  return useQuery({
    queryKey: queryKeys.rubricTemplates.resolved(cycleId ?? 0, trackId ?? 0, templateType ?? ""),
    queryFn: () => rubricTemplateService.resolve(cycleId as number, trackId as number, templateType as string),
    enabled: Boolean(cycleId && trackId && templateType),
  });
}

function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.rubricTemplates.all() });
}

export function useUpdateRubricTemplateMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTemplatePayload }) =>
      rubricTemplateService.update(id, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.rubricSaved"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.rubricSaveFailed")),
  });
}

export function useSaveRubricScopesMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveScopesPayload }) =>
      rubricTemplateService.saveScopes(id, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.rubricScopesSaved"));
      invalidate();
    },
    // BE trả 409 kèm tên bộ đang giữ lĩnh vực đó → hiện nguyên văn cho Admin biết gỡ ở đâu.
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.rubricScopesFailed")),
  });
}

export function useDuplicateRubricTemplateMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (id: number) => rubricTemplateService.duplicate(id),
    onSuccess: () => {
      toast.success(i18n.t("toast.rubricDuplicated"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.rubricDuplicateFailed")),
  });
}
