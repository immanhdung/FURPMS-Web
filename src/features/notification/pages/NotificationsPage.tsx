import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationStore } from "@/store/notification.store";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { t } = useTranslation();
  const { isLoading } = useNotificationsQuery();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <Bell className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("notifications.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0 ? t("notifications.unread", { count: unreadCount }) : t("notifications.allCaughtUp")}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={unreadCount === 0}>
          <CheckCheck />
          {t("notifications.readAll")}
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title={t("notifications.empty")} description={t("notifications.emptyDesc")} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/95 shadow-soft-sm backdrop-blur-sm">
          {notifications.map((notification, index) => (
            <motion.li
              key={notification.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
              onClick={() => !notification.read && markAsRead.mutate(notification.id)}
              className={cn(
                "cursor-pointer px-4 py-3 transition-colors hover:bg-muted/60",
                !notification.read && "bg-primary/3"
              )}
            >
              <div className="flex items-start gap-2">
                {!notification.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                <div className={cn("min-w-0 flex-1", notification.read && "pl-3.5")}>
                  <p className="break-words text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="break-words whitespace-pre-line text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
