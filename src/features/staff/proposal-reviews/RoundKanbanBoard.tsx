import { motion } from "motion/react";
import { CalendarClock, Gavel, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import { ROUND_BUCKETS, getRoundBucket, roundTitle, type RoundBucket } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

interface RoundKanbanBoardProps {
  rounds: ReviewRound[];
  onSelect: (round: ReviewRound) => void;
}

const BUCKET_STYLES: Record<RoundBucket, { dot: string; header: string; accent: string }> = {
  not_started: {
    dot: "bg-muted-foreground",
    header: "text-muted-foreground",
    accent: "before:bg-muted-foreground/40",
  },
  in_progress: {
    dot: "bg-primary",
    header: "text-primary",
    accent: "before:bg-primary",
  },
  completed: {
    dot: "bg-success",
    header: "text-success",
    accent: "before:bg-success",
  },
};

export function RoundKanbanBoard({ rounds, onSelect }: RoundKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ROUND_BUCKETS.map((bucket) => {
        const bucketRounds = rounds.filter((round) => getRoundBucket(round) === bucket.id);
        const style = BUCKET_STYLES[bucket.id];
        return (
          <div key={bucket.id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("size-1.5 rounded-full", style.dot)} />
                <p className={cn("text-sm font-semibold", style.header)}>{bucket.label}</p>
              </div>
              <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-soft-xs">
                {bucketRounds.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {bucketRounds.map((round, index) => (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  whileHover={{ y: -2 }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(round)}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(round)}
                    className={cn(
                      "relative cursor-pointer overflow-hidden py-0 shadow-soft-xs transition-shadow duration-200 hover:shadow-soft-md",
                      "before:absolute before:inset-y-0 before:left-0 before:w-1",
                      style.accent
                    )}
                  >
                    <CardContent className="space-y-2 p-3.5 pl-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{roundTitle(round)}</p>
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
                            <Gavel className="size-3.5" /> Council set
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
                  No rounds
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
