import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CouncilCandidates } from "@/types/council-candidate";

export const councilCandidateService = {
  /**
   * Ứng viên ủy viên đã xếp hạng theo chuyên môn.
   *
   * Thay cho `/ai/suggest-reviewers` (gọi vào 404 từ trước tới nay). Đây là một phép nối bảng
   * người ↔ lĩnh vực rồi sắp xếp — không phải AI, và được gọi đúng tên như vậy.
   */
  list: (params: { councilId?: string; projectId?: string; trackId?: number }) =>
    axiosClient
      .get<ApiResponse<CouncilCandidates>>("/councils/candidates", { params })
      .then((res) => res.data.data),
};
