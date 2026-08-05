import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { rubricTemplateService } from "@/services/api/rubric-template.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type {
  CreateTemplatePayload,
  SaveCriterionPayload,
  SaveScopesPayload,
  UpdateTemplatePayload,
} from "@/types/rubric-template";

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

/** Bộ áp dụng cho 1 hội đồng — form chấm điểm dùng cái này (BE tự suy đợt+lĩnh vực+loại vòng). */
export function useRubricForCouncilQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.rubricTemplates.forCouncil(councilId ?? ""),
    queryFn: () => rubricTemplateService.forCouncil(councilId as string),
    enabled: Boolean(councilId),
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

/** Gắn/gỡ bộ tiêu chí riêng cho 1 vòng chấm (mỗi vòng có thể dùng bộ khác nhau, hoặc chung 1 bộ). */
export function useSetRoundRubricMutation(cycleId?: number, trackId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, templateId }: { roundId: string; templateId: number | null }) =>
      rubricTemplateService.setRoundTemplate(roundId, templateId),
    onSuccess: () => {
      toast.success(i18n.t("toast.roundRubricSaved"));
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewBoard.board(cycleId ?? 0, trackId ?? 0) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rubricTemplates.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.roundRubricFailed")),
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

// ── CRUD bộ tiêu chí (P4 vá 05/08) ─────────────────────────────────────────
// Trước đây chỉ có PATCH tên + duplicate: không tạo/xoá được bộ, và tiêu chí chỉ
// thêm qua /rubric-criteria (gom theo LOẠI VÒNG nên luôn rơi vào bộ đầu tiên).

export function useCreateRubricTemplateMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => rubricTemplateService.create(payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.rubricSetCreated"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.rubricSetCreateFailed")),
  });
}

export function useDeleteRubricTemplateMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (id: number) => rubricTemplateService.remove(id),
    onSuccess: () => {
      toast.success(i18n.t("toast.rubricSetDeleted"));
      invalidate();
    },
    // BE trả 409 kèm lý do rõ (đã dùng chấm điểm / đang gắn cho vòng) — hiện nguyên văn.
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.rubricSetDeleteFailed")),
  });
}

export function useSaveTemplateCriterionMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ templateId, criterionId, payload }: {
      templateId: number; criterionId?: number; payload: SaveCriterionPayload;
    }) =>
      criterionId
        ? rubricTemplateService.updateCriterion(templateId, criterionId, payload)
        : rubricTemplateService.addCriterion(templateId, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.criterionSaved"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.criterionSaveFailed")),
  });
}

export function useDeleteTemplateCriterionMutation() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ templateId, criterionId }: { templateId: number; criterionId: number }) =>
      rubricTemplateService.removeCriterion(templateId, criterionId),
    onSuccess: (res) => {
      // BE có thể chỉ TẮT thay vì xoá (khi tiêu chí đã có điểm) — hiện đúng lời BE nói.
      toast.success(res?.message || i18n.t("toast.criterionDeleted"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.criterionDeleteFailed")),
  });
}
