import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Deliverable, EvaluateDeliverablePayload, SubmitDeliverablePayload } from "@/types/deliverable";

export const deliverableService = {
  listByContract: (contractId: string) =>
    axiosClient.get<ApiResponse<Deliverable[]>>(`/contracts/${contractId}/deliverables`).then((res) => res.data.data),

  /** Staff thêm 1 sản phẩm phải nộp cho hợp đồng. */
  create: (contractId: string, payload: { productName: string; dueDate?: string; description?: string }) =>
    axiosClient
      .post<ApiResponse<Deliverable>>(`/contracts/${contractId}/deliverables`, payload)
      .then((res) => res.data.data),

  /** PI nộp sản phẩm (link file). */
  submit: (id: number, payload: SubmitDeliverablePayload) =>
    axiosClient.post<ApiResponse<Deliverable>>(`/deliverables/${id}/submit`, payload).then((res) => res.data.data),

  /** Staff nghiệm thu PASSED/FAILED. */
  evaluate: (id: number, payload: EvaluateDeliverablePayload) =>
    axiosClient.post<ApiResponse<Deliverable>>(`/deliverables/${id}/evaluate`, payload).then((res) => res.data.data),
};
