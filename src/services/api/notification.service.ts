import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { AppNotification, NotificationCount, NotificationDto } from "@/types/notification";

function toAppNotification(notification: NotificationDto): AppNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.isRead,
    createdAt: notification.createdAt,
  };
}

export const notificationService = {
  list: () =>
    axiosClient
      .get<ApiResponse<NotificationDto[]>>("/notifications")
      .then((res) => res.data.data.map(toAppNotification)),

  count: () =>
    axiosClient.get<ApiResponse<NotificationCount>>("/notifications/count").then((res) => res.data.data),

  markAsRead: (id: string) =>
    axiosClient.patch<ApiResponse<null>>(`/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: () => axiosClient.patch<ApiResponse<null>>("/notifications/read-all").then((res) => res.data),
};
