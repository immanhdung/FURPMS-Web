import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { FinancialConfig, FinancialConfigPayload } from "@/types/financial-config";

export const financialConfigService = {
  list: () => axiosClient.get<ApiResponse<FinancialConfig[]>>("/financial-configs").then((res) => res.data.data),

  create: (payload: FinancialConfigPayload) =>
    axiosClient.post<ApiResponse<FinancialConfig>>("/financial-configs", payload).then((res) => res.data.data),

  update: (id: number, payload: FinancialConfigPayload) =>
    axiosClient.put<ApiResponse<FinancialConfig>>(`/financial-configs/${id}`, payload).then((res) => res.data.data),
};
