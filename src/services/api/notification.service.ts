import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AppNotification } from "@/types/notification";

export const notificationService = {
  list: () =>
    axiosClient.get<ApiResponse<AppNotification[]>>("/notifications").then((res) => res.data.data),

  count: () =>
    axiosClient.get<ApiResponse<number>>("/notifications/count").then((res) => res.data.data),

  markAsRead: (id: string) =>
    axiosClient.patch<ApiResponse<null>>(`/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: () => axiosClient.patch<ApiResponse<null>>("/notifications/read-all").then((res) => res.data),
};
