import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { CalendarClock, CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { formatDateTime } from "@/utils/format";
import { getRoundBucket, roundTitle } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

/**
 * Số ngày còn lại tới hạn chấm.
 *
 * Chỗ này FE tự tính vì `GET /proposals/{id}/rounds` chỉ trả ngày, không trả `daysLeft` như
 * `/timeline` — chấp nhận được vì lệch múi giờ tối đa một ngày và badge chỉ để liếc nhanh. Còn
 * cờ quá hạn dùng để CHẶN/CẢNH BÁO thì luôn lấy `isScoringOverdue` do máy chủ tính.
 */
function deadlineDaysLeft(round: ReviewRound): number | null {
  if (!round.scoringDeadline) return null;
  const diff = Math.ceil((new Date(round.scoringDeadline).getTime() - Date.now()) / 86_400_000);
  return Number.isFinite(diff) ? diff : null;
}

interface RoundTimelineProps {
  rounds: ReviewRound[];
  /** Có truyền thì mỗi vòng hiện nút đặt/dời hạn chấm (chỉ Staff/Admin dùng). */
  onSetDeadline?: (round: ReviewRound) => void;
}

/**
 * Timeline chỉ-đọc của một đề cương. Phần thao tác vòng/hội đồng nằm duy nhất ở màn
 * Hội đồng & Chấm; ở đây giữ lại tín hiệu trực quan để Staff biết đề cương đang đi tới đâu.
 */
export function RoundTimeline({ rounds, onSetDeadline }: RoundTimelineProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const sorted = [...rounds].sort((a, b) => a.sequence - b.sequence);

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
        {t("staff.noRoundsYet")}
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 pl-2" aria-label={t("staff.roundsSection")}>
      <div aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-border" />

      {sorted.map((round, index) => {
        const bucket = getRoundBucket(round);
        const Icon = bucket === "completed" ? CheckCircle2 : bucket === "in_progress" ? CircleDot : Circle;

        return (
          <motion.li
            key={round.id}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: reduceMotion ? 0 : index * 0.05 }}
            className="relative flex gap-3 pl-0.5"
          >
            <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-background">
              <Icon
                aria-hidden
                className={
                  bucket === "completed"
                    ? "size-5 text-success"
                    : bucket === "in_progress"
                      ? "size-5 text-primary"
                      : "size-5 text-muted-foreground"
                }
              />
            </div>

            <Card className="flex-1">
              <CardContent className="space-y-1.5 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{roundTitle(round, t)}</p>
                  <div className="flex items-center gap-2">
                    {/* Hạn CHẤM — trước 25/08 giai đoạn chấm không có hạn nào, vòng mở ra rồi
                        để đấy. Vòng đã chốt kết quả thì hạn hết ý nghĩa, không bày ra nữa. */}
                    {round.status !== "PASSED" && round.status !== "FAILED" && (
                      <DeadlineBadge
                        deadline={round.scoringDeadline}
                        daysLeft={deadlineDaysLeft(round)}
                        basis={t("roundDeadline.basis")}
                      />
                    )}
                    {round.status && <StatusBadge status={round.status} />}
                  </div>
                </div>
                {round.dimension && (
                  <p className="text-xs text-muted-foreground">
                    {t("staff.dimension", {
                      value: t(`reviewBoard.dim.${round.dimension}`, { defaultValue: round.dimension }),
                    })}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {round.openedAt && <span>{t("staff.opened", { at: formatDateTime(round.openedAt) })}</span>}
                  {round.closedAt && <span>{t("staff.closed", { at: formatDateTime(round.closedAt) })}</span>}
                  {round.result && (
                    <span>
                      {t("staff.resultLabel", {
                        value: t(`status.${round.result}`, { defaultValue: round.result }),
                      })}
                    </span>
                  )}
                </div>

                {onSetDeadline && round.status !== "PASSED" && round.status !== "FAILED" && (
                  <Button variant="link" size="sm" className="h-auto px-0" onClick={() => onSetDeadline(round)}>
                    <CalendarClock />
                    {round.scoringDeadline ? t("roundDeadline.extendAction") : t("roundDeadline.setAction")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.li>
        );
      })}
    </ol>
  );
}
