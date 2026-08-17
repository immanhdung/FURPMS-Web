import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CalendarClock, CalendarPlus, ExternalLink, MapPin, Pencil, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCouncilMeetingsQuery, useDeleteMeetingMutation, useScheduleConflictsQuery } from "@/hooks/useMeetings";
import { ScheduleMeetingSheet } from "@/features/staff/proposal-reviews/ScheduleMeetingSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { externalUrl, formatDateTime } from "@/utils/format";
import type { Meeting } from "@/types/meeting";

export function MeetingsPanel({ councilId }: { councilId: string }) {
  const { t } = useTranslation();
  const { data: meetings, isLoading } = useCouncilMeetingsQuery(councilId);
  const { data: conflicts } = useScheduleConflictsQuery(councilId);
  const deleteMutation = useDeleteMeetingMutation(councilId);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  // Cùng một sheet dùng cho đặt lịch và sửa — có `editing` là chế độ sửa.
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState<Meeting | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t("staff.meetingsPanel")}</p>
        <Button size="sm" onClick={() => setScheduleOpen(true)}>
          <CalendarPlus />
          {t("staff.scheduleMeeting")}
        </Button>
      </div>

      {conflicts && conflicts.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-warning">
            <AlertTriangle className="size-4" />
            {t("staff.conflictTitle")}
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-foreground">
            {conflicts.map((c, i) => (
              <li key={i}>
                {t("staff.conflictRow", { name: c.memberName, time: formatDateTime(c.otherMeetingAt) })}
              </li>
            ))}
          </ul>
        </div>
      )}

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
              {meeting.location && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {meeting.location}
                </p>
              )}
              {meeting.meetingLink && (
                <a
                  href={externalUrl(meeting.meetingLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("staff.joinLink")}
                </a>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Nút Bắt đầu/Kết thúc họp đã bỏ (17/08) — xem chú thích ở meetings/columns.tsx. */}
                {/* Rule #17: đổi lịch được BẤT KỲ LÚC NÀO, nên nút Sửa luôn hiện. */}
                <Button variant="ghost" size="sm" onClick={() => setEditing(meeting)}>
                  <Pencil />
                  {t("common.edit")}
                </Button>
                {/* Xoá chỉ bày khi buổi họp chưa diễn ra — đúng điều kiện BE chặn (409).
                    Bày nút rồi báo lỗi chỉ làm người dùng tưởng hệ thống hỏng. */}
                {meeting.status === "SCHEDULED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(meeting)}
                  >
                    <Trash2 />
                    {t("common.delete")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScheduleMeetingSheet open={scheduleOpen} onOpenChange={setScheduleOpen} councilId={councilId} />

      <ScheduleMeetingSheet
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        councilId={councilId}
        meeting={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("reviewBoard.deleteMeeting")}
        description={t("reviewBoard.deleteMeetingConfirm", {
          time: deleting ? formatDateTime(deleting.scheduledAt) : "",
        })}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
