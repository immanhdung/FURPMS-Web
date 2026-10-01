import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { ReviewBoardRound } from "@/types/review-board";

type MilestoneState = "done" | "current" | "upcoming" | "late";

interface Milestone {
  key: string;
  label: string;
  date: string | null;
  state: MilestoneState;
  /** Căn cứ / trạng thái — hiện thẳng dưới ngày, không giấu trong tooltip. */
  note?: string | null;
  extra?: React.ReactNode;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 864e5);

/**
 * Dải 4 mốc của một vòng chấm: mở vòng → hạn chấm → hạn họp hội đồng → chốt kết quả.
 *
 * <p><b>Vì sao (01/10):</b> trước đây màn "Hội đồng & Chấm" chỉ hiện hạn chấm khi vòng CÒN MỞ — vòng
 * đã chốt là mất sạch mốc, nhìn vào tưởng hệ thống không có deadline, trong khi hội đồng bảo vệ lần 2
 * yêu cầu đúng điều này: "thể hiện rõ các mốc thời gian deadline cho các giai đoạn". Nay vòng nào cũng
 * hiện đủ 4 mốc, mỗi mốc kèm căn cứ (QĐ543 Điều 8.3.a cho hạn họp).</p>
 */
export function RoundTimelineStrip({
  round,
  onSetDeadline,
}: {
  round: ReviewBoardRound;
  onSetDeadline: (round: ReviewBoardRound) => void;
}) {
  const { t } = useTranslation();
  const status = round.status?.toUpperCase();
  const closed = status === "PASSED" || status === "FAILED" || Boolean(round.closedAt);
  const opened = Boolean(round.openedAt) || status === "OPEN" || closed;

  // Hạn họp: hội đồng nào đã lập thì có hạn (ghi trên hội đồng, hoặc suy ra từ ngày lập).
  const meetings = round.councils
    .map((c, i) => ({ n: i + 1, deadline: c.meetingDeadline, derived: c.isMeetingDeadlineDerived, est: c.establishedAt }))
    .filter((m) => m.deadline);
  // Mốc đại diện = hạn họp SẮP TỚI gần nhất; hết hạn cả rồi thì lấy hạn muộn nhất. Lấy hội đồng
  // đầu tiên là sai khi vòng có nhiều hội đồng lập ở các thời điểm khác nhau.
  const todayIso = new Date().toISOString().slice(0, 10);
  const byDate = [...meetings].sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  const firstMeeting = byDate.find((m) => String(m.deadline) >= todayIso) ?? byDate.at(-1);

  // Không có hạn để so (vòng tạo trước khi có luật hạn chấm) thì chấm xám — đừng tô xanh như đã xong.
  const scoringState: MilestoneState = !round.scoringDeadline
    ? "upcoming"
    : closed
    ? round.scoringDeadline && round.closedAt && daysBetween(round.scoringDeadline, round.closedAt) > 0
      ? "late"
      : "done"
    : round.isScoringOverdue
      ? "late"
      : opened
        ? "current"
        : "upcoming";

  const closedNote =
    closed && round.closedAt && round.scoringDeadline
      ? daysBetween(round.scoringDeadline, round.closedAt) > 0
        ? t("reviewBoard.ms.closedLate", { n: daysBetween(round.scoringDeadline, round.closedAt) })
        : t("reviewBoard.ms.closedOnTime")
      : null;

  const milestones: Milestone[] = [
    {
      key: "opened",
      label: t("reviewBoard.ms.opened"),
      date: round.openedAt ?? null,
      state: opened ? "done" : "upcoming",
      note: opened ? null : t("reviewBoard.ms.notOpened"),
    },
    {
      key: "scoring",
      label: t("reviewBoard.ms.scoring"),
      date: round.scoringDeadline ?? null,
      state: scoringState,
      note: round.scoringDeadline
        ? `${t("reviewBoard.ms.scoringBasis")}${round.isScoringExtended && closed ? ` · ${t("reviewBoard.ms.extended")}` : ""}`
        : t("reviewBoard.ms.noDeadline"),
      extra: !closed ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {round.scoringDeadline && (
            <DeadlineBadge
              deadline={round.scoringDeadline}
              daysLeft={round.scoringDaysLeft}
              isExtended={Boolean(round.isScoringExtended)}
            />
          )}
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => onSetDeadline(round)}>
            <CalendarClock className="size-3.5" />
            {round.scoringDeadline ? t("roundDeadline.extendTitle") : t("roundDeadline.setTitle")}
          </Button>
        </div>
      ) : null,
    },
    {
      key: "meeting",
      label: t("reviewBoard.ms.meeting"),
      date: firstMeeting?.deadline ?? null,
      state: closed ? "done" : firstMeeting ? "current" : "upcoming",
      note: firstMeeting
        ? `${t("reviewBoard.ms.meetingBasis")}${firstMeeting.derived && firstMeeting.est ? ` · ${t("reviewBoard.ms.derivedFrom", { date: formatDate(firstMeeting.est) })}` : ""}`
        : t("reviewBoard.ms.noCouncil"),
      extra:
        meetings.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            {meetings.map((m) => `${t("reviewBoard.councilN", { n: m.n })}: ${formatDate(m.deadline)}`).join(" · ")}
          </p>
        ) : null,
    },
    {
      key: "closed",
      label: t("reviewBoard.ms.closed"),
      date: round.closedAt ?? null,
      state: closed ? (closedNote && scoringState === "late" ? "late" : "done") : "upcoming",
      note: closed ? closedNote : t("reviewBoard.ms.notClosed"),
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{t("reviewBoard.ms.title")}</p>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {milestones.map((m, i) => (
          <li key={m.key} className="relative flex gap-3">
            {/* Đường nối sang mốc sau — chỉ ở màn rộng, khi 4 mốc nằm trên một hàng. */}
            {i < milestones.length - 1 && (
              <span aria-hidden className="absolute top-2 left-5 hidden h-px w-[calc(100%-0.5rem)] bg-border lg:block" />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 size-3.5 shrink-0 rounded-full border-2 bg-background",
                m.state === "done" && "border-success bg-success",
                m.state === "current" && "border-primary",
                m.state === "late" && "border-destructive bg-destructive",
                m.state === "upcoming" && "border-muted-foreground/30"
              )}
            />
            <div className="min-w-0 space-y-1">
              {/* Nền đặc che đường nối phía sau để chữ không bị gạch ngang. */}
              <p className="relative z-10 inline-block bg-card pr-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {m.label}
              </p>
              <p className={cn("text-sm font-semibold tabular-nums", m.date ? "text-foreground" : "text-muted-foreground")}>
                {m.date ? formatDate(m.date) : "—"}
              </p>
              {m.note && (
                <p className={cn("text-xs", m.state === "late" ? "text-destructive" : "text-muted-foreground")}>{m.note}</p>
              )}
              {m.extra}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
