import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { DecisionResponse, SaveMinutesPayload } from "@/types/decision";

export const decisionService = {
  get: (councilId: string) =>
    axiosClient
      .get<ApiResponse<DecisionResponse | null>>(`/review-scoring/councils/${councilId}/decision`)
      .then((res) => res.data.data),

  /** Thư ký soạn/sửa biên bản → lưu bản NHÁP (chưa đổi trạng thái đề tài). */
  saveMinutes: (councilId: string, payload: SaveMinutesPayload) =>
    axiosClient
      .post<ApiResponse<DecisionResponse>>(`/review-scoring/councils/${councilId}/minutes`, payload)
      .then((res) => res.data.data),

  /** Chủ tịch duyệt = KHÓA biên bản; BE tự cập nhật đề tài + vòng chấm (rule #12). */
  approveMinutes: (councilId: string) =>
    axiosClient
      .post<ApiResponse<DecisionResponse>>(`/review-scoring/councils/${councilId}/minutes/approve`)
      .then((res) => res.data.data),
};
