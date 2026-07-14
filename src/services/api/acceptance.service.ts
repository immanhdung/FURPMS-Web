import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AcceptancePayload, AcceptanceResponse } from "@/types/acceptance";

export const acceptanceService = {
  get: (councilId: string) =>
    axiosClient
      .get<ApiResponse<AcceptanceResponse | null>>(`/councils/${councilId}/acceptance`)
      .then((res) => res.data.data),

  submit: (councilId: string, payload: AcceptancePayload) =>
    axiosClient
      .post<ApiResponse<AcceptanceResponse>>(`/councils/${councilId}/acceptance`, payload)
      .then((res) => res.data.data),
};
