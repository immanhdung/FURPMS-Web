import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, CheckCheck, ChevronDown, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationStore } from "@/store/notification.store";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotificationsQuery } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { NotificationType } from "@/types/notification";

const TYPE_FILTERS: { labelKey: string; value: NotificationType | "ALL" }[] = [
  { labelKey: "notifications.filterAll", value: "ALL" },
  { labelKey: "notifications.filterProposals", value: "PROPOSAL" },
  { labelKey: "notifications.filterReviews", value: "REVIEW" },
  { labelKey: "notifications.filterMeetings", value: "MEETING" },
];

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useNotificationsQuery();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const filtered = filter === "ALL" ? notifications : notifications.filter((n) => n.type === filter);

  const openNotificationTarget = (link: string) => {
    // Một thông báo cũ của BE dùng đường API `/proposals/my` làm đường giao diện. Chuẩn hoá ở
    // biên nhận dữ liệu để người dùng không bị đưa tới route không tồn tại khi bấm xem chi tiết.
    const target = link === "/proposals/my" ? ROUTES.MY_PROPOSALS : link;
    setOpen(false);
    navigate(target);
  };

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
          <span className="sr-only">{t("notifications.title")}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">{t("notifications.title")}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            {t("notifications.readAll")}
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
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        <ScrollArea className="h-80">
          {filtered.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title={t("notifications.empty")}
              description={t("notifications.emptyDesc")}
              className="min-h-56 border-none"
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((notification) => {
                const expanded = expandedId === notification.id;

                return (
                  <li
                    key={notification.id}
                    className={cn("transition-colors hover:bg-muted/60", !notification.read && "bg-primary/3")}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      className="flex w-full items-start gap-2 px-4 py-3 text-left"
                      onClick={() => {
                        setExpandedId(expanded ? null : notification.id);
                        if (!notification.read) markAsRead.mutate(notification.id);
                      }}
                    >
                      {!notification.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                      <div className={cn("min-w-0 flex-1", notification.read && "pl-3.5")}>
                        <p className={cn("text-sm font-medium text-foreground", !expanded && "truncate")}>
                          {notification.title}
                        </p>
                        <p
                          className={cn(
                            "break-words whitespace-pre-line text-xs text-muted-foreground",
                            !expanded && "line-clamp-2"
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform",
                          expanded && "rotate-180"
                        )}
                      />
                    </button>

                    {expanded && notification.link && (
                      <div className="flex justify-end px-4 pb-2.5">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-7 gap-1 px-0 text-xs"
                          onClick={() => openNotificationTarget(notification.link!)}
                        >
                          {t("staff.viewDetail")}
                          <ExternalLink className="size-3" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
