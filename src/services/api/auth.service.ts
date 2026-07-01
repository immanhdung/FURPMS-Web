import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ChangePasswordRequest, LoginRequest, LoginResponse, User } from "@/types/auth";

export const authService = {
  login: (payload: LoginRequest) =>
    axiosClient
      .post<ApiResponse<LoginResponse>>("/auth/login", payload)
      .then((res) => res.data.data),

  getCurrentUser: () =>
    axiosClient.get<ApiResponse<User>>("/auth/me").then((res) => res.data.data),

  changePassword: (payload: ChangePasswordRequest) =>
    axiosClient.post<ApiResponse<null>>("/auth/change-password", payload).then((res) => res.data),
};
