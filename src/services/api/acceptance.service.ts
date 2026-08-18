import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AcceptancePayload, AcceptanceResponse } from "@/types/acceptance";

export const acceptanceService = {
  /**
   * Phiếu nghiệm thu của CHÍNH mình (null nếu chưa chấm). Trước đây gọi `/acceptance` — endpoint đó
   * trả MẢNG mọi phiếu và chỉ cho Admin/Staff → reviewer bị 403 + form seed sai.
   */
  get: (councilId: string, projectId: string) =>
    axiosClient
      .get<ApiResponse<AcceptanceResponse | null>>(`/councils/${councilId}/acceptance/my`, {
        params: { projectId },
      })
      .then((res) => res.data.data),

  submit: (councilId: string, payload: AcceptancePayload) =>
    axiosClient
      .post<ApiResponse<AcceptanceResponse>>(`/councils/${councilId}/acceptance`, payload)
      .then((res) => res.data.data),
};
