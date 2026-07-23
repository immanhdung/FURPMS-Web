import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/format";
import { getRoundBucket, roundTitle } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

interface RoundTimelineProps {
  rounds: ReviewRound[];
  onSelect: (round: ReviewRound) => void;
}

export function RoundTimeline({ rounds, onSelect }: RoundTimelineProps) {
  const { t } = useTranslation();
  const sorted = [...rounds].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="relative space-y-4 pl-2">
      <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />

      {sorted.map((round, index) => {
        const bucket = getRoundBucket(round);
        const Icon = bucket === "completed" ? CheckCircle2 : bucket === "in_progress" ? CircleDot : Circle;

        return (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="relative flex gap-3 pl-0.5"
          >
            <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-background">
              <Icon
                className={
                  bucket === "completed"
                    ? "size-5 text-success"
                    : bucket === "in_progress"
                      ? "size-5 text-primary"
                      : "size-5 text-muted-foreground"
                }
              />
            </div>

            <Card role="button" tabIndex={0} onClick={() => onSelect(round)} className="flex-1 cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="space-y-1.5 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{roundTitle(round, t)}</p>
                  {round.status && <Badge variant="secondary">{round.status}</Badge>}
                </div>
                {round.dimension && <p className="text-xs text-muted-foreground">{t("staff.dimension", { value: round.dimension })}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {round.openedAt && <span>{t("staff.opened", { at: formatDateTime(round.openedAt) })}</span>}
                  {round.closedAt && <span>{t("staff.closed", { at: formatDateTime(round.closedAt) })}</span>}
                  {round.result && <span>{t("staff.resultLabel", { value: round.result })}</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {sorted.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
          {t("staff.noRoundsYet")}
        </p>
      )}
    </div>
  );
}
