import { Gavel } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { useDecisionQuery } from "@/hooks/useDecision";
import { formatDateTime } from "@/utils/format";

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

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Final decision</p>
          {decision.result && <StatusBadge status={decision.result} />}
        </div>
        {decision.councilComments && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Council comments</p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{decision.councilComments}</p>
          </div>
        )}
        {decision.recommendations && (
          <div>
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
