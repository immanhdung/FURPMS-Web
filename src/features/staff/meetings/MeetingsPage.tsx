import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useEndMeetingMutation, useMeetingsQuery, useStartMeetingMutation } from "@/hooks/useMeetings";
import { getMeetingColumns } from "@/features/staff/meetings/columns";
import { ROUTES } from "@/constants/routes";

export function MeetingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMeetingsQuery();
  const startMutation = useStartMeetingMutation();
  const endMutation = useEndMeetingMutation();

  const columns = useMemo(
    () =>
      getMeetingColumns({
        t,
        onStart: (meeting) => startMutation.mutate(meeting.id),
        onEnd: (meeting) => endMutation.mutate(meeting.id),
      }),
    [t, startMutation, endMutation]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.meetingsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("staff.meetingsSubtitle")}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 size-4 shrink-0" />
        {t("staff.meetingsHintPre")}
        <Link to={ROUTES.PROPOSAL_REVIEWS} className="font-medium text-primary hover:underline">
          {t("staff.meetingsHintLink")}
        </Link>
        {t("staff.meetingsHintPost")}
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
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
