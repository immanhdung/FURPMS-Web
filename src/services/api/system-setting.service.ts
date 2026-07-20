import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { SystemSetting, UploadPolicy } from "@/types/system-setting";

export const systemSettingService = {
  /** Admin only. */
  list: () => axiosClient.get<ApiResponse<SystemSetting[]>>("/system-settings").then((res) => res.data.data),

  /** Mọi user đăng nhập — dùng để chặn file quá cỡ ngay trên trình duyệt. */
  uploadPolicy: () =>
    axiosClient.get<ApiResponse<UploadPolicy>>("/system-settings/upload-policy").then((res) => res.data.data),

  update: (key: string, value: string) =>
    axiosClient.put<ApiResponse<SystemSetting>>(`/system-settings/${key}`, { value }).then((res) => res.data.data),
};
