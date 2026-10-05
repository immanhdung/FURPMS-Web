import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  CreateTemplatePayload,
  RubricTemplateFull,
  SaveCriterionPayload,
  SaveScopesPayload,
  UpdateTemplatePayload,
} from "@/types/rubric-template";

/**
 * "Bộ tiêu chí" chấm: 1 bộ chứa nhiều tiêu chí, gắn được cho loại đề tài (Cơ bản/Ứng dụng)
 * và nhiều (đợt + lĩnh vực). Mỗi (đợt + lĩnh vực + loại vòng) chỉ 1 bộ.
 */
export const rubricTemplateService = {
  list: () =>
    axiosClient.get<ApiResponse<RubricTemplateFull[]>>("/rubric-templates").then((res) => res.data.data),

  /** Bộ áp dụng cho (đợt, lĩnh vực, loại vòng); không có bộ riêng → bộ mặc định. */
  resolve: (cycleId: number, trackId: number, templateType: string) =>
    axiosClient
      .get<ApiResponse<RubricTemplateFull | null>>("/rubric-templates/resolve", {
        params: { cycleId, trackId, templateType },
      })
      .then((res) => res.data.data),

  /**
   * Bộ áp dụng cho 1 hội đồng — reviewer chấm chỉ có councilId, BE tự suy
   * (đợt, lĩnh vực, loại vòng) từ hội đồng đó. Không có bộ riêng → bộ mặc định.
   */
  forCouncil: (councilId: string) =>
    axiosClient
      .get<ApiResponse<RubricTemplateFull | null>>(`/rubric-templates/for-council/${councilId}`)
      .then((res) => res.data.data),

  /** Tạo bộ MỚI có tên riêng. Trước đây không có đường tạo bộ — chỉ "thêm tiêu chí" và BE
   *  tự gom vào bộ đầu tiên cùng loại vòng, nên không thể có 2 bộ khác nội dung. */
  create: (payload: CreateTemplatePayload) =>
    axiosClient.post<ApiResponse<RubricTemplateFull>>("/rubric-templates", payload).then((res) => res.data.data),

  /** BE chặn xoá nếu bộ đã dùng để chấm (mất lịch sử điểm) hoặc đang gắn cho 1 vòng. */
  remove: (id: number) =>
    axiosClient.delete<ApiResponse<null>>(`/rubric-templates/${id}`).then((res) => res.data),

  addCriterion: (templateId: number, payload: SaveCriterionPayload) =>
    axiosClient
      .post<ApiResponse<null>>(`/rubric-templates/${templateId}/criteria`, payload)
      .then((res) => res.data),

  updateCriterion: (templateId: number, criterionId: number, payload: SaveCriterionPayload) =>
    axiosClient
      .put<ApiResponse<null>>(`/rubric-templates/${templateId}/criteria/${criterionId}`, payload)
      .then((res) => res.data),

  /** Tiêu chí đã có điểm chấm thì BE chỉ TẮT chứ không xoá — giữ lịch sử. */
  removeCriterion: (templateId: number, criterionId: number) =>
    axiosClient
      .delete<ApiResponse<null>>(`/rubric-templates/${templateId}/criteria/${criterionId}`)
      .then((res) => res.data),

  update: (id: number, payload: UpdateTemplatePayload) =>
    axiosClient.patch<ApiResponse<null>>(`/rubric-templates/${id}`, payload).then((res) => res.data),

  saveScopes: (id: number, payload: SaveScopesPayload) =>
    axiosClient.put<ApiResponse<null>>(`/rubric-templates/${id}/scopes`, payload).then((res) => res.data),

  /** Gắn/gỡ bộ RIÊNG cho 1 vòng chấm. null = bỏ gắn, dùng bộ theo (đợt + lĩnh vực). */
  setRoundTemplate: (roundId: string, templateId: number | null) =>
    axiosClient
      .patch<ApiResponse<null>>(`/rubric-templates/rounds/${roundId}`, { templateId })
      .then((res) => res.data),

  duplicate: (id: number) =>
    axiosClient
      .post<ApiResponse<RubricTemplateFull>>(`/rubric-templates/${id}/duplicate`)
      .then((res) => res.data.data),
};
