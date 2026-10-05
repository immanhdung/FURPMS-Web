import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateResearchOrderPayload, ResearchOrder } from "@/types/research-order";

export interface ResearchOrderListParams {
  cycleId?: number;
  status?: string;
}

export const researchOrderService = {
  list: (params?: ResearchOrderListParams) =>
    axiosClient.get<ApiResponse<ResearchOrder[]>>("/research-orders", { params }).then((res) => res.data.data),

  getById: (id: number) =>
    axiosClient.get<ApiResponse<ResearchOrder>>(`/research-orders/${id}`).then((res) => res.data.data),

  create: (payload: CreateResearchOrderPayload) =>
    axiosClient.post<ApiResponse<ResearchOrder>>("/research-orders", payload).then((res) => res.data.data),
};
