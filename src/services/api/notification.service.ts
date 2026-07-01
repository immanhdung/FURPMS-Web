import { axiosClient } from "@/services/api/axiosClient";
import type { AppNotification } from "@/types/notification";

export const notificationService = {
  list: () => axiosClient.get<AppNotification[]>("/notifications").then((res) => res.data),

  markAsRead: (id: string) => axiosClient.patch<void>(`/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: () => axiosClient.patch<void>("/notifications/read-all").then((res) => res.data),
};
