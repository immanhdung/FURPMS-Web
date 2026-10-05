import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ChangePasswordRequest, LoginRequest, LoginResponse, User } from "@/types/auth";

export const authService = {
  /** Quên mật khẩu — máy chủ LUÔN trả 200 dù email có tồn tại hay không (chống dò tài khoản). */
  forgotPassword: (email: string) =>
    axiosClient.post<ApiResponse<null>>("/auth/forgot-password", { email }).then((res) => res.data),

  /** Đặt lại mật khẩu bằng mã trong thư — mã dùng một lần, hết hạn sau 30 phút. */
  resetPassword: (token: string, newPassword: string) =>
    axiosClient.post<ApiResponse<null>>("/auth/reset-password", { token, newPassword }).then((res) => res.data),

  login: (payload: LoginRequest) =>
    axiosClient
      .post<ApiResponse<LoginResponse>>("/auth/login", payload)
      .then((res) => res.data.data),

  getCurrentUser: () =>
    axiosClient.get<ApiResponse<User>>("/auth/me").then((res) => res.data.data),

  changePassword: (payload: ChangePasswordRequest) =>
    axiosClient.post<ApiResponse<null>>("/auth/change-password", payload).then((res) => res.data),
};
