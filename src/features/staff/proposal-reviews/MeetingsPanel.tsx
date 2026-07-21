import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, CalendarPlus, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCouncilMeetingsQuery, useEndMeetingMutation, useStartMeetingMutation } from "@/hooks/useMeetings";
import { ScheduleMeetingSheet } from "@/features/staff/proposal-reviews/ScheduleMeetingSheet";
import { formatDateTime } from "@/utils/format";

export function MeetingsPanel({ councilId }: { councilId: string }) {
  const { t } = useTranslation();
  const { data: meetings, isLoading } = useCouncilMeetingsQuery(councilId);
  const startMutation = useStartMeetingMutation();
  const endMutation = useEndMeetingMutation();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t("staff.meetingsPanel")}</p>
        <Button size="sm" onClick={() => setScheduleOpen(true)}>
          <CalendarPlus />
          {t("staff.scheduleMeeting")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !meetings || meetings.length === 0 ? (
        <EmptyState icon={Video} title={t("staff.noMeetingsScheduled")} className="min-h-32 border-none p-4" />
      ) : (
        <ul className="space-y-2">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{meeting.title ?? t("staff.councilMeeting")}</p>
                {meeting.status && <StatusBadge status={meeting.status} />}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {t("staff.meetingInfo", { time: formatDateTime(meeting.scheduledAt), min: meeting.durationMinutes, platform: meeting.platform })}
              </p>
              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("staff.joinLink")}
                </a>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => startMutation.mutate(meeting.id)} disabled={startMutation.isPending}>
                  {t("staff.startMeeting")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => endMutation.mutate(meeting.id)} disabled={endMutation.isPending}>
                  {t("staff.endMeeting")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScheduleMeetingSheet open={scheduleOpen} onOpenChange={setScheduleOpen} councilId={councilId} />
    </div>
  );
}
