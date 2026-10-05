import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, ExternalLink, MapPin, Video } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { daysUntil, externalUrl, formatDate } from "@/utils/format";
import type { Meeting } from "@/types/meeting";

const dayKey = (iso: string) => iso.slice(0, 10);
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Lịch họp dạng agenda — gom mọi buổi họp hội đồng theo NGÀY (tăng dần). Bản nhẹ, thuần FE
 * (không phụ thuộc Google). Ngày đã qua làm mờ; hôm nay/sắp tới hiện rõ + link tham gia/địa điểm.
 */
export function MeetingsAgenda({ meetings }: { meetings: Meeting[] }) {
  const { t } = useTranslation();
  const todayKey = new Date().toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const sorted = [...meetings].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const map = new Map<string, Meeting[]>();
    for (const m of sorted) {
      const k = dayKey(m.scheduledAt);
      (map.get(k) ?? map.set(k, []).get(k)!).push(m);
    }
    return Array.from(map.entries());
  }, [meetings]);

  if (groups.length === 0) {
    return <EmptyState icon={CalendarClock} title={t("staff.noMeetings")} description={t("staff.noMeetingsDesc")} />;
  }

  return (
    <div className="space-y-5">
      {groups.map(([day, items]) => {
        const past = day < todayKey;
        return (
          <div key={day} className={cn(past && "opacity-60")}>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{formatDate(day)}</p>
              {day === todayKey ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t("staff.today")}
                </span>
              ) : (
                // Buổi họp là CUỘC HẸN, không phải hạn nộp — nên ở đây chỉ đếm ngược, cố ý KHÔNG
                // dùng DeadlineBadge: nhãn "quá hạn 3 ngày" cho một buổi họp đã diễn ra là sai nghĩa.
                !past && <span className="text-xs text-muted-foreground">{t("deadline.daysLeft", { n: daysUntil(day) ?? 0 })}</span>
              )}
            </div>
            <ul className="space-y-2">
              {items.map((m) => (
                <li key={m.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="w-14 shrink-0 text-sm font-medium text-foreground">{timeOf(m.scheduledAt)}</div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{m.title || t("staff.councilMeeting")}</span>
                      {m.status && <StatusBadge status={m.status} />}
                      <span className="text-xs text-muted-foreground">{m.durationMinutes} {t("staff.minutes")}</span>
                    </div>
                    {m.meetingLink ? (
                      <a
                        href={externalUrl(m.meetingLink)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Video className="size-3.5" />
                        {t("staff.joinOnline")}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : m.location ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {m.location}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
