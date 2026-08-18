import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/utils/format";
import { getRoundBucket, roundTitle } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

interface RoundTimelineProps {
  rounds: ReviewRound[];
}

/**
 * Timeline chỉ-đọc của một đề cương. Phần thao tác vòng/hội đồng nằm duy nhất ở màn
 * Hội đồng & Chấm; ở đây giữ lại tín hiệu trực quan để Staff biết đề cương đang đi tới đâu.
 */
export function RoundTimeline({ rounds }: RoundTimelineProps) {
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
                  {round.status && <StatusBadge status={round.status} />}
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
              </CardContent>
            </Card>
          </motion.li>
        );
      })}
    </ol>
  );
}
