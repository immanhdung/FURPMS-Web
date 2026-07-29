import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCheck,
  ClipboardCheck,
  FileSignature,
  FileText,
  Gavel,
  Info,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationStore } from "@/store/notification.store";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";

const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  PROPOSAL: FileText,
  REVIEW: ClipboardCheck,
  COUNCIL: Gavel,
  MEETING: CalendarClock,
  CONTRACT: FileSignature,
  SYSTEM: Info,
};

export function NotificationsPage() {
  const { isLoading } = useNotificationsQuery();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary shadow-soft-xs">
            <Bell className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={unreadCount === 0}>
          <CheckCheck />
          Read all
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <div className="flex items-start gap-3 p-4">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description="You're all caught up for now." />
      ) : (
        <ul className="space-y-2.5">
          {notifications.map((notification, index) => {
            const Icon = NOTIFICATION_ICONS[notification.type] ?? Info;
            return (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card
                  onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-md",
                    !notification.read && "border-primary/20 bg-primary/3"
                  )}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        !notification.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
                        {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
