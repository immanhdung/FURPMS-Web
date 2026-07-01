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
