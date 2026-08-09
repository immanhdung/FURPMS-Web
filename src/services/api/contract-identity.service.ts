import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ContractIdentity, ContractIdentityPayload } from "@/types/contract-identity";

// Chỉ có đường "/me": chính chủ tự khai, Staff không gõ hộ (quyết định 08/08).
export const contractIdentityService = {
  get: () =>
    axiosClient
      .get<ApiResponse<ContractIdentity>>("/users/me/contract-identity")
      .then((res) => res.data.data),

  update: (payload: ContractIdentityPayload) =>
    axiosClient
      .put<ApiResponse<ContractIdentity>>("/users/me/contract-identity", payload)
      .then((res) => res.data.data),
};
