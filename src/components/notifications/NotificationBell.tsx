import { useState } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationStore } from "@/store/notification.store";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotificationsQuery } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";

const TYPE_FILTERS: { label: string; value: NotificationType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Proposals", value: "PROPOSAL" },
  { label: "Reviews", value: "REVIEW" },
  { label: "Meetings", value: "MEETING" },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | "ALL">("ALL");

  useNotificationsQuery();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const filtered = filter === "ALL" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-danger-foreground"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            Read all
          </Button>
        </div>

        <div className="flex gap-1 border-b border-border px-3 py-2">
          {TYPE_FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                filter === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ScrollArea className="h-80">
          {filtered.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="No notifications"
              description="You're all caught up for now."
              className="min-h-56 border-none"
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                  className={cn(
                    "cursor-pointer px-4 py-3 transition-colors hover:bg-muted/60",
                    !notification.read && "bg-primary/3"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className={cn("min-w-0 flex-1", notification.read && "pl-3.5")}>
                      <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
