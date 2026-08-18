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

  // Xoá MỀM: người còn ràng buộc (chủ nhiệm đề tài / ủy viên hội đồng) bị BE chặn kèm lời khuyên
  // chuyển sang vô hiệu hoá — thông báo đó hiển thị nguyên văn cho Admin.
  remove: (id: string) => axiosClient.delete<ApiResponse>(`/users/${id}`).then((res) => res.data),

  // Khoá / mở đăng nhập mà vẫn giữ tên trên mọi hồ sơ đã ký — lối thoát cho các trường hợp không xoá được.
  toggleActive: (id: string) =>
    axiosClient.patch<ApiResponse<AdminUser>>(`/users/${id}/toggle-active`).then((res) => res.data.data),
};
