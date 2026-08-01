import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { MeetingsAgenda } from "@/features/staff/meetings/MeetingsAgenda";
import { useMyMeetingsQuery } from "@/hooks/useMeetings";

/**
 * Lịch họp hội đồng chấm đề tài của PI. Theo Process_Spec, PI **trình bày trước hội đồng**
 * rồi rời phòng khi họp kín → PI cần biết ngày/giờ + địa điểm (offline) hoặc link (online).
 * Trước đây chỉ Staff/Reviewer xem được lịch, PI không có màn nào.
 */
export function MyMeetingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMeetingsQuery();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <CalendarClock className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("piMeetings.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("piMeetings.subtitle")}</p>
        </div>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <MeetingsAgenda meetings={data ?? []} />
      )}
    </div>
  );
}
