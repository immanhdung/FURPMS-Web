import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CalendarClock, ClipboardCheck, FileSignature, FileText, Gavel, History, Info } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRelativeTime } from "@/utils/format";
import type { ActivityItem, ActivityType } from "@/types/dashboard";

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  proposal: FileText,
  review: ClipboardCheck,
  council: Gavel,
  meeting: CalendarClock,
  contract: FileSignature,
  system: Info,
};

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
  title?: string;
}

export function ActivityFeed({ items, isLoading = false, title }: ActivityFeedProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title ?? t("activity.recent")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : items.length === 0 ? (
          <EmptyState icon={History} title={t("activity.noRecent")} className="min-h-40 border-none p-0" />
        ) : (
          <ul className="space-y-4">
            {items.map((item, index) => {
              const Icon = ACTIVITY_ICONS[item.type];
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{item.actor}</span> {item.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityFeedSkeleton() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}
