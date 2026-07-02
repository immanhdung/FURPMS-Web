import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { RubricScoringForm } from "@/features/reviewer/proposal-review/RubricScoringForm";
import { FeedbackForm } from "@/features/reviewer/proposal-review/FeedbackForm";
import { AcceptanceEvaluationForm } from "@/features/reviewer/proposal-review/AcceptanceEvaluationForm";
import { DecisionView } from "@/features/reviewer/proposal-review/DecisionView";
import { REVIEW_ROUND_TYPE } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function ProposalReviewWorkspace() {
  const { councilId } = useParams<{ councilId: string }>();
  const navigate = useNavigate();
  const { data: memberships, isLoading } = useMyMembershipsQuery();

  const membership = memberships?.find((m) => m.councilId === councilId);

  if (isLoading) return <PageLoader label="Loading review..." />;

  if (!councilId || !membership) {
    return (
      <EmptyState
        title="Review not found"
        description="This council isn't among your memberships, or the invitation hasn't been accepted yet."
      />
    );
  }

  const isAcceptanceRound = membership.roundType === REVIEW_ROUND_TYPE.ACCEPTANCE;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.ASSIGNED_REVIEWS)}>
        <ArrowLeft />
        Back to assigned reviews
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {membership.proposalTitleVI || "Untitled proposal"}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {membership.roundType && <Badge variant="secondary">{membership.roundType}</Badge>}
          {membership.memberRole && <Badge variant="outline">{membership.memberRole}</Badge>}
          {membership.roundStatus && <StatusBadge status={membership.roundStatus} />}
          {membership.proposalStatus && <StatusBadge status={membership.proposalStatus} />}
        </div>
      </div>

      <Tabs defaultValue="scoring">
        <TabsList>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          {isAcceptanceRound && <TabsTrigger value="acceptance">Acceptance</TabsTrigger>}
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring">
          <RubricScoringForm councilId={councilId} roundType={membership.roundType ?? REVIEW_ROUND_TYPE.REVIEW} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackForm councilId={councilId} />
        </TabsContent>

        {isAcceptanceRound && (
          <TabsContent value="acceptance">
            <AcceptanceEvaluationForm councilId={councilId} />
          </TabsContent>
        )}

        <TabsContent value="decision">
          <DecisionView councilId={councilId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
