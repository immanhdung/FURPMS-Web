import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";
import { queryKeys } from "@/services/queryKeys";
import { useNotificationStore } from "@/store/notification.store";
import { useAuthStore } from "@/store/auth.store";

export function useNotificationsQuery() {
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const notifications = await notificationService.list();
      setNotifications(notifications);
      return notifications;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,

    /*
     * Chuông TỰ CẬP NHẬT — trước đây phải tải lại trang mới thấy thông báo mới, nên mọi thứ hệ
     * thống báo đều đến muộn (thư mời hội đồng, kết quả xét duyệt, gia hạn hạn nộp…).
     *
     * Hỏi lại máy chủ mỗi 60 giây, và hỏi ngay khi người dùng quay lại tab. Đây là cách rẻ nhất:
     * không cần SignalR/WebSocket, không thêm hạ tầng, mà độ trễ tối đa một phút là đủ cho loại
     * việc này. `refetchIntervalInBackground` để mặc định (false) — tab bị ẩn thì ngừng hỏi, khỏi
     * nện máy chủ bằng những tab người ta bỏ quên.
     */
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead() {
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: (id) => markAsRead(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
  });
}

export function useMarkAllNotificationsAsRead() {
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: () => markAllAsRead(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
  });
}
