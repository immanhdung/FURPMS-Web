import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { PROPOSAL_STATUS } from "@/constants/statuses";

const STAGES = [
  { key: PROPOSAL_STATUS.DRAFT, label: "timeline.draft" },
  { key: PROPOSAL_STATUS.SUBMITTED, label: "timeline.submitted" },
  { key: PROPOSAL_STATUS.UNDER_REVIEW, label: "timeline.underReview" },
  { key: "DECISION", label: "timeline.decision" },
];

function stageIndexFor(status: string) {
  if (status === PROPOSAL_STATUS.APPROVED || status === PROPOSAL_STATUS.REJECTED) return 3;
  if (status === PROPOSAL_STATUS.UNDER_REVIEW || status === PROPOSAL_STATUS.WITHDRAWN) return 2;
  if (status === PROPOSAL_STATUS.SUBMITTED) return 1;
  return 0;
}

export function ProposalStatusTimeline({ status: rawStatus }: { status: string }) {
  const { t } = useTranslation();
  const status = rawStatus?.toUpperCase();
  const isTerminalNegative = status === PROPOSAL_STATUS.REJECTED || status === PROPOSAL_STATUS.WITHDRAWN;
  const activeIndex = stageIndexFor(status);

  return (
    <div className="space-y-3">
      {status === PROPOSAL_STATUS.WITHDRAWN && (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {t("timeline.withdrawnNote")}
        </div>
      )}

      <div className="flex items-center">
        {STAGES.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isNegativeTerminal = isCurrent && isTerminalNegative && index === 3;
          const isPositiveTerminal = isCurrent && status === PROPOSAL_STATUS.APPROVED && index === 3;

          return (
            <div key={stage.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{ scale: isCurrent ? 1.08 : 1 }}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isNegativeTerminal && "bg-danger/10 text-danger ring-2 ring-danger",
                    isPositiveTerminal && "bg-success/10 text-success ring-2 ring-success",
                    !isNegativeTerminal && !isPositiveTerminal && isCompleted && "bg-primary text-primary-foreground",
                    !isNegativeTerminal && !isPositiveTerminal && isCurrent && "bg-primary/10 text-primary ring-2 ring-primary",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isNegativeTerminal ? <X className="size-4" /> : isCompleted || isPositiveTerminal ? <Check className="size-4" /> : index + 1}
                </motion.div>
                <p className={cn("text-center text-xs font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {index === 3 && isNegativeTerminal ? (status === PROPOSAL_STATUS.WITHDRAWN ? t("timeline.withdrawn") : t("timeline.rejected")) : t(stage.label)}
                </p>
              </div>

              {index < STAGES.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-border">
                  <motion.div
                    className="h-px bg-primary"
                    initial={false}
                    animate={{ width: index < activeIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
