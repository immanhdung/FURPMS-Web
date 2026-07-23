import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Contract, CreateContractPayload } from "@/types/contract";

export const contractService = {
  list: () => axiosClient.get<ApiResponse<Contract[]>>("/contracts").then((res) => res.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<Contract>>(`/contracts/${id}`).then((res) => res.data.data),

  create: (payload: CreateContractPayload) =>
    axiosClient.post<ApiResponse<Contract>>("/contracts", payload).then((res) => res.data.data),

  sign: (id: string) => axiosClient.post<ApiResponse<Contract>>(`/contracts/${id}/sign`).then((res) => res.data.data),
};
