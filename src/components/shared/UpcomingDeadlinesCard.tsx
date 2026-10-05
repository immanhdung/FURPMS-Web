import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { useMyDeadlinesQuery } from "@/hooks/useMyDeadlines";
import { cn } from "@/lib/utils";

/**
 * Thẻ "Hạn sắp tới" trên bảng điều khiển — gộp hạn từ mọi đề tài người dùng liên quan.
 *
 * <p>Máy chủ đã lọc theo vai và sắp sẵn (quá hạn lên đầu, rồi tới hạn gần nhất), nên ở đây chỉ
 * cắt lấy N dòng đầu. Không tự sắp lại: thứ tự là một phần của câu trả lời, không phải trang trí.</p>
 */
export function UpcomingDeadlinesCard({ limit = 6, days = 30 }: { limit?: number; days?: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useMyDeadlinesQuery(days);

  const items = (data ?? []).slice(0, limit);
  const overdueCount = (data ?? []).filter((d) => d.stage.status === "OVERDUE").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CalendarClock className="size-3.5" />
            </span>
            {t("myDeadlines.title")}
          </CardTitle>
          {overdueCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {t("myDeadlines.overdueCount", { n: overdueCount })}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          // Không có hạn nào sắp tới là TIN TỐT — nói ra như tin tốt, đừng để ô trống trơ trông
          // như hệ thống chưa tải xong.
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("myDeadlines.empty", { n: days })}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${item.projectId}-${item.stage.code}-${item.stage.entityId ?? item.stage.order}`}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                  item.stage.status === "OVERDUE" ? "border-destructive/40 bg-destructive/5" : "border-border"
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {t(`projectTimeline.stage.${item.stage.code}`, { defaultValue: item.stage.code })}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.projectTitle}</p>
                </div>
                <DeadlineBadge
                  deadline={item.stage.deadline}
                  daysLeft={item.stage.daysLeft}
                  basis={item.stage.deadlineBasis}
                  isExtended={item.stage.isExtended}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
