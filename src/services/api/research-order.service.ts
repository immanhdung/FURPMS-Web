import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateResearchOrderPayload, ResearchOrder } from "@/types/research-order";

export const researchOrderService = {
  list: () => axiosClient.get<ApiResponse<ResearchOrder[]>>("/research-orders").then((res) => res.data.data),

  getById: (id: number) =>
    axiosClient.get<ApiResponse<ResearchOrder>>(`/research-orders/${id}`).then((res) => res.data.data),

  create: (payload: CreateResearchOrderPayload) =>
    axiosClient.post<ApiResponse<ResearchOrder>>("/research-orders", payload).then((res) => res.data.data),
};
