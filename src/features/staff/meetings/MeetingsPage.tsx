import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock, CalendarDays, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useMeetingsQuery } from "@/hooks/useMeetings";
import { getMeetingColumns } from "@/features/staff/meetings/columns";
import { MeetingsAgenda } from "@/features/staff/meetings/MeetingsAgenda";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { sortByDateDesc } from "@/utils/sort";

export function MeetingsPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const { data, isLoading, isError, refetch, isRefetching } = useMeetingsQuery();
  const sortedData = useMemo(() => sortByDateDesc(data, (m) => m.scheduledAt), [data]);

  const columns = useMemo(
    () =>
      getMeetingColumns({ t }),
    [t]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.meetingsTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("staff.meetingsSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <Button
            variant={view === "calendar" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1 text-xs", view !== "calendar" && "text-muted-foreground")}
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="size-3.5" />
            {t("staff.viewCalendar")}
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1 text-xs", view !== "table" && "text-muted-foreground")}
            onClick={() => setView("table")}
          >
            <Table2 className="size-3.5" />
            {t("staff.viewTable")}
          </Button>
        </div>
      </motion.div>

      <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
        {t("staff.meetingsHintPre")}
        <Link to={ROUTES.PROPOSAL_REVIEWS} className="font-medium text-primary hover:underline">
          {t("staff.meetingsHintLink")}
        </Link>
        {t("staff.meetingsHintPost")}
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : view === "calendar" ? (
        <MeetingsAgenda meetings={data ?? []} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedData}
          isLoading={isLoading}
          searchPlaceholder={t("staff.meetingsSearch")}
          exportFileName="meetings"
          emptyTitle={t("staff.noMeetings")}
          emptyDescription={t("staff.noMeetingsDesc")}
        />
      )}
    </div>
  );
}
