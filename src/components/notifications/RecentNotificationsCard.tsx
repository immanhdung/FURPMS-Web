import { Link } from "react-router-dom";
import { BellOff } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationStore } from "@/store/notification.store";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function RecentNotificationsCard({ limit = 5 }: { limit?: number }) {
  const { isLoading } = useNotificationsQuery();
  const notifications = useNotificationStore((state) => state.notifications).slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Notifications</CardTitle>
        <CardAction>
          <Link to={ROUTES.NOTIFICATIONS} className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications" className="min-h-40 border-none p-0" />
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    notification.read ? "bg-transparent" : "bg-primary"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
