import { AlertTriangle, CheckCircle2, Gavel, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDecisionQuery } from "@/hooks/useDecision";
import { REVIEW_DECISION } from "@/constants/statuses";
import { formatDateTime } from "@/utils/format";

const DECISION_STYLES: Record<string, { icon: LucideIcon; badge: string; banner: string }> = {
  [REVIEW_DECISION.APPROVED]: {
    icon: CheckCircle2,
    badge: "bg-success/10 text-success",
    banner: "border-l-success bg-success/5",
  },
  [REVIEW_DECISION.REJECTED]: {
    icon: XCircle,
    badge: "bg-danger/10 text-danger",
    banner: "border-l-danger bg-danger/5",
  },
  [REVIEW_DECISION.REVISION_REQUIRED]: {
    icon: AlertTriangle,
    badge: "bg-warning/10 text-warning",
    banner: "border-l-warning bg-warning/5",
  },
};

export function DecisionView({ councilId }: { councilId: string }) {
  const { data: decision, isLoading } = useDecisionQuery(councilId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!decision?.finalizedAt) {
    return (
      <EmptyState
        icon={Gavel}
        title="Decision pending"
        description="The council chairman hasn't finalized a decision for this proposal yet."
      />
    );
  }

  const style = decision.result ? DECISION_STYLES[decision.result.toUpperCase()] : undefined;
  const Icon = style?.icon ?? Gavel;

  return (
    <Card className={cn("border-l-4", style?.banner ?? "border-l-border")}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              style?.badge ?? "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Final decision</p>
            <p className="text-base font-semibold tracking-tight text-foreground">
              {decision.result ?? "Unspecified"}
            </p>
          </div>
        </div>

        {decision.councilComments && (
          <div className="rounded-lg bg-card/60 p-3">
            <p className="text-xs font-medium text-muted-foreground">Council comments</p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{decision.councilComments}</p>
          </div>
        )}
        {decision.recommendations && (
          <div className="rounded-lg bg-card/60 p-3">
            <p className="text-xs font-medium text-muted-foreground">Recommendations</p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{decision.recommendations}</p>
          </div>
        )}
        {decision.finalizedAt && (
          <p className="text-xs text-muted-foreground">Finalized {formatDateTime(decision.finalizedAt)}</p>
        )}
      </CardContent>
    </Card>
  );
}
