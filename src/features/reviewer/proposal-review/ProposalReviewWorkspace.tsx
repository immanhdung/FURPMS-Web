import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { useCouncilMeetingsQuery } from "@/hooks/useMeetings";
import { RubricScoringForm } from "@/features/reviewer/proposal-review/RubricScoringForm";
import { FeedbackForm } from "@/features/reviewer/proposal-review/FeedbackForm";
import { AcceptanceEvaluationForm } from "@/features/reviewer/proposal-review/AcceptanceEvaluationForm";
import { MinutesPanel } from "@/features/reviewer/proposal-review/MinutesPanel";
import { COUNCIL_MEMBER_ROLE, REVIEW_ROUND_TYPE } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/utils/format";

export function ProposalReviewWorkspace() {
  const { councilId } = useParams<{ councilId: string }>();
  const navigate = useNavigate();
  const { data: memberships, isLoading } = useMyMembershipsQuery();
  const { data: meetings } = useCouncilMeetingsQuery(councilId ?? null);

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

  const isAcceptanceRound = membership.roundType?.toUpperCase() === REVIEW_ROUND_TYPE.ACCEPTANCE;
  // The secretary compiles the meeting minutes rather than scoring the proposal themselves.
  const isSecretary = membership.memberRole === COUNCIL_MEMBER_ROLE.SECRETARY;

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

      {meetings && meetings.length > 0 && (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{meeting.title ?? "Council meeting"}</span>
                <span className="text-muted-foreground">
                  · {formatDateTime(meeting.scheduledAt)} · {meeting.durationMinutes}min
                  {meeting.platform && ` · ${meeting.platform}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {meeting.status && <StatusBadge status={meeting.status} />}
                {meeting.meetingLink && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      Join meeting
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue={isSecretary ? "minutes" : "scoring"}>
        <TabsList>
          {!isSecretary && <TabsTrigger value="scoring">Scoring</TabsTrigger>}
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          {isAcceptanceRound && <TabsTrigger value="acceptance">Acceptance</TabsTrigger>}
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
        </TabsList>

        {!isSecretary && (
          <TabsContent value="scoring">
            <RubricScoringForm councilId={councilId} roundType={membership.roundType ?? REVIEW_ROUND_TYPE.REVIEW} />
          </TabsContent>
        )}

        <TabsContent value="feedback">
          <FeedbackForm councilId={councilId} />
        </TabsContent>

        {isAcceptanceRound && (
          <TabsContent value="acceptance">
            <AcceptanceEvaluationForm councilId={councilId} />
          </TabsContent>
        )}

        <TabsContent value="minutes">
          <MinutesPanel councilId={councilId} memberRole={membership.memberRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
