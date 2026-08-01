import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { RubricTemplateFull, SaveScopesPayload, UpdateTemplatePayload } from "@/types/rubric-template";

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

  update: (id: number, payload: UpdateTemplatePayload) =>
    axiosClient.patch<ApiResponse<null>>(`/rubric-templates/${id}`, payload).then((res) => res.data),

  saveScopes: (id: number, payload: SaveScopesPayload) =>
    axiosClient.put<ApiResponse<null>>(`/rubric-templates/${id}/scopes`, payload).then((res) => res.data),

  duplicate: (id: number) =>
    axiosClient
      .post<ApiResponse<RubricTemplateFull>>(`/rubric-templates/${id}/duplicate`)
      .then((res) => res.data.data),
};
