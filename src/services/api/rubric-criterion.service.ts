import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { RubricCriterion, RubricCriterionPayload } from "@/types/rubric-criterion";

export const rubricCriterionService = {
  list: (roundType?: string) =>
    axiosClient
      .get<ApiResponse<RubricCriterion[]>>("/rubric-criteria", { params: roundType ? { roundType } : undefined })
      .then((res) => res.data.data),

  create: (payload: RubricCriterionPayload) =>
    axiosClient.post<ApiResponse<RubricCriterion>>("/rubric-criteria", payload).then((res) => res.data.data),

  update: (id: number, payload: RubricCriterionPayload) =>
    axiosClient.put<ApiResponse<RubricCriterion>>(`/rubric-criteria/${id}`, payload).then((res) => res.data.data),

  remove: (id: number) => axiosClient.delete<ApiResponse<null>>(`/rubric-criteria/${id}`).then((res) => res.data),
};
