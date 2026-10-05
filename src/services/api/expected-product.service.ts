import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ExpectedProduct, ExpectedProductPayload } from "@/types/expected-product";

export const expectedProductService = {
  list: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<ExpectedProduct[]>>(`/proposals/${proposalId}/expected-products`)
      .then((res) => res.data.data),

  create: (proposalId: string, payload: ExpectedProductPayload) =>
    axiosClient
      .post<ApiResponse<ExpectedProduct>>(`/proposals/${proposalId}/expected-products`, payload)
      .then((res) => res.data.data),

  update: (proposalId: string, productId: number, payload: ExpectedProductPayload) =>
    axiosClient
      .put<ApiResponse<ExpectedProduct>>(`/proposals/${proposalId}/expected-products/${productId}`, payload)
      .then((res) => res.data.data),

  remove: (proposalId: string, productId: number) =>
    axiosClient.delete<ApiResponse<null>>(`/proposals/${proposalId}/expected-products/${productId}`),
};
