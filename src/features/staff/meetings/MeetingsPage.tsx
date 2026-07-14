import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useEndMeetingMutation, useMeetingsQuery, useStartMeetingMutation } from "@/hooks/useMeetings";
import { getMeetingColumns } from "@/features/staff/meetings/columns";
import { ROUTES } from "@/constants/routes";

export function MeetingsPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useMeetingsQuery();
  const startMutation = useStartMeetingMutation();
  const endMutation = useEndMeetingMutation();

  const columns = useMemo(
    () =>
      getMeetingColumns({
        onStart: (meeting) => startMutation.mutate(meeting.id),
        onEnd: (meeting) => endMutation.mutate(meeting.id),
      }),
    [startMutation, endMutation]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meetings</h1>
        <p className="mt-1 text-sm text-muted-foreground">All council meetings you have access to.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 size-4 shrink-0" />
        To schedule a new meeting, open a proposal's{" "}
        <Link to={ROUTES.PROPOSAL_REVIEWS} className="font-medium text-primary hover:underline">
          review round
        </Link>{" "}
        and use its council's Meetings tab.
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search meetings..."
          exportFileName="meetings"
          emptyTitle="No meetings found"
          emptyDescription="Meetings scheduled for your councils will appear here."
        />
      )}
    </div>
  );
}
