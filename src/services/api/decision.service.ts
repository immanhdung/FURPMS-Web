import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { DecisionResponse, SaveMinutesPayload } from "@/types/decision";

export const decisionService = {
  get: (councilId: string, projectId?: string) =>
    axiosClient
      .get<ApiResponse<DecisionResponse | null>>(`/review-scoring/councils/${councilId}/decision`, {
        params: projectId ? { projectId } : undefined,
      })
      .then((res) => res.data.data),

  /** Thư ký soạn/sửa biên bản → lưu bản NHÁP (chưa đổi trạng thái đề tài). */
  saveMinutes: (councilId: string, payload: SaveMinutesPayload) =>
    axiosClient
      .post<ApiResponse<DecisionResponse>>(`/review-scoring/councils/${councilId}/minutes`, payload)
      .then((res) => res.data.data),

  /** Chủ tịch duyệt = KHÓA biên bản; BE tự cập nhật đề tài + vòng chấm (rule #12). */
  approveMinutes: (councilId: string, projectId?: string) =>
    axiosClient
      .post<ApiResponse<DecisionResponse>>(
        `/review-scoring/councils/${councilId}/minutes/approve`,
        null,
        { params: projectId ? { projectId } : undefined }
      )
      .then((res) => res.data.data),

  /**
   * Chủ tịch TRẢ biên bản cho Thư ký sửa, kèm ghi chú.
   *
   * QĐ543 Điều 8.3.c: Thư ký ghi biên bản, hội đồng thông qua — Chủ tịch không tự sửa chữ của
   * Thư ký. Trước đây chỉ có "duyệt (khoá luôn)" hoặc không làm gì, nên muốn sửa một chỗ là
   * phải liên lạc ngoài hệ thống.
   */
  requestRevision: (councilId: string, note: string, projectId?: string) =>
    axiosClient
      .post<ApiResponse<DecisionResponse>>(
        `/review-scoring/councils/${councilId}/minutes/request-revision`,
        { note },
        { params: projectId ? { projectId } : undefined }
      )
      .then((res) => res.data.data),
};
