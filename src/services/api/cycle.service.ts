import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Cycle, CyclePayload } from "@/types/cycle";

export const cycleService = {
  list: () => axiosClient.get<ApiResponse<Cycle[]>>("/cycles").then((res) => res.data.data),

  getById: (id: number) => axiosClient.get<ApiResponse<Cycle>>(`/cycles/${id}`).then((res) => res.data.data),

  create: (payload: CyclePayload) => axiosClient.post<ApiResponse<Cycle>>("/cycles", payload).then((res) => res.data.data),

  update: (id: number, payload: CyclePayload) =>
    axiosClient.put<ApiResponse<Cycle>>(`/cycles/${id}`, payload).then((res) => res.data.data),

  open: (id: number) => axiosClient.post<ApiResponse<Cycle>>(`/cycles/${id}/open`).then((res) => res.data.data),

  close: (id: number) => axiosClient.post<ApiResponse<Cycle>>(`/cycles/${id}/close`).then((res) => res.data.data),
};
