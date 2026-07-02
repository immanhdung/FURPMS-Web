import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateResearchTypePayload, ResearchType, UpdateResearchTypePayload } from "@/types/research-type";

export const researchTypeService = {
  list: (includeInactive = false) =>
    axiosClient
      .get<ApiResponse<ResearchType[]>>("/cycles/research-types", { params: { includeInactive } })
      .then((res) => res.data.data),

  create: (payload: CreateResearchTypePayload) =>
    axiosClient.post<ApiResponse<ResearchType>>("/cycles/research-types", payload).then((res) => res.data.data),

  update: (id: number, payload: UpdateResearchTypePayload) =>
    axiosClient.put<ApiResponse<ResearchType>>(`/cycles/research-types/${id}`, payload).then((res) => res.data.data),

  remove: (id: number) =>
    axiosClient.delete<ApiResponse<null>>(`/cycles/research-types/${id}`).then((res) => res.data),
};
