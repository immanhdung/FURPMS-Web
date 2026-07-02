import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "@/types/user";

export const userService = {
  list: () => axiosClient.get<ApiResponse<AdminUser[]>>("/users").then((res) => res.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<AdminUser>>(`/users/${id}`).then((res) => res.data.data),

  create: (payload: CreateUserPayload) =>
    axiosClient.post<ApiResponse<AdminUser>>("/users", payload).then((res) => res.data.data),

  update: (id: string, payload: UpdateUserPayload) =>
    axiosClient.put<ApiResponse<AdminUser>>(`/users/${id}`, payload).then((res) => res.data.data),
};
