import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock, Gavel, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { ROUND_BUCKETS, getRoundBucket, roundTitle } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

interface RoundKanbanBoardProps {
  rounds: ReviewRound[];
  onSelect: (round: ReviewRound) => void;
}

export function RoundKanbanBoard({ rounds, onSelect }: RoundKanbanBoardProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ROUND_BUCKETS.map((bucket) => {
        const bucketRounds = rounds.filter((round) => getRoundBucket(round) === bucket.id);
        return (
          <div key={bucket.id} className="space-y-2.5 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-medium text-foreground">{t(bucket.labelKey)}</p>
              <span className="text-xs text-muted-foreground">{bucketRounds.length}</span>
            </div>

            <div className="space-y-2.5">
              {bucketRounds.map((round, index) => (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(round)}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(round)}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                  >
                    <CardContent className="space-y-2 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{roundTitle(round, t)}</p>
                        {round.dimension && (
                          <Badge variant="secondary" className="shrink-0">
                            {round.dimension}
                          </Badge>
                        )}
                      </div>

                      {round.status && <p className="text-xs text-muted-foreground">{round.status}</p>}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                        {round.councilId && (
                          <span className="flex items-center gap-1">
                            <Gavel className="size-3.5" /> {t("staff.councilSet")}
                          </span>
                        )}
                        {round.members && round.members.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" /> {round.members.length}
                          </span>
                        )}
                        {round.openedAt && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="size-3.5" /> {formatDate(round.openedAt)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {bucketRounds.length === 0 && (
                <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  {t("staff.noRounds")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
