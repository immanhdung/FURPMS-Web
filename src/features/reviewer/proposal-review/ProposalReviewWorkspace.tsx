import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarClock, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { useCouncilMeetingsQuery } from "@/hooks/useMeetings";
import { RubricScoringForm } from "@/features/reviewer/proposal-review/RubricScoringForm";
import { AcceptanceEvaluationForm } from "@/features/reviewer/proposal-review/AcceptanceEvaluationForm";
import { MinutesPanel } from "@/features/reviewer/proposal-review/MinutesPanel";
import { COUNCIL_MEMBER_ROLE, REVIEW_ROUND_TYPE, ROUND_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/utils/format";

export function ProposalReviewWorkspace() {
  const { t } = useTranslation();
  const { councilId } = useParams<{ councilId: string }>();
  const navigate = useNavigate();
  const { data: memberships, isLoading } = useMyMembershipsQuery();
  const { data: meetings } = useCouncilMeetingsQuery(councilId ?? null);

  const membership = memberships?.find((m) => m.councilId === councilId);

  if (isLoading) return <PageLoader label="Loading review..." />;

  if (!councilId || !membership) {
    return (
      <EmptyState
        title={t("reviewWorkspace.notFound")}
        description={t("reviewWorkspace.notFoundDesc")}
      />
    );
  }

  const isAcceptanceRound = membership.roundType?.toUpperCase() === REVIEW_ROUND_TYPE.ACCEPTANCE;
  // The secretary compiles the meeting minutes rather than scoring the proposal themselves.
  const isSecretary = membership.memberRole === COUNCIL_MEMBER_ROLE.SECRETARY;
  // Staff must open the round before reviewers can score/evaluate it.
  const isRoundOpen = membership.roundStatus?.toUpperCase() === ROUND_STATUS.OPEN;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.ASSIGNED_REVIEWS)}>
        <ArrowLeft />
        {t("reviewWorkspace.backToAssigned")}
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
                <span className="font-medium">{meeting.title ?? t("reviewWorkspace.councilMeeting")}</span>
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
                      {t("reviewWorkspace.joinMeeting")}
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
          {!isSecretary && <TabsTrigger value="scoring">{t("reviewWorkspace.tabScoring")}</TabsTrigger>}
          {isAcceptanceRound && <TabsTrigger value="acceptance">{t("reviewWorkspace.tabAcceptance")}</TabsTrigger>}
          <TabsTrigger value="minutes">{t("reviewWorkspace.tabMinutes")}</TabsTrigger>
        </TabsList>

        {!isSecretary && (
          <TabsContent value="scoring">
            {isRoundOpen ? (
              <RubricScoringForm councilId={councilId} roundType={membership.roundType ?? REVIEW_ROUND_TYPE.REVIEW} />
            ) : (
              <EmptyState
                icon={Lock}
                title={t("reviewWorkspace.roundNotOpen")}
                description={t("reviewWorkspace.roundNotOpenDesc")}
              />
            )}
          </TabsContent>
        )}

        {isAcceptanceRound && (
          <TabsContent value="acceptance">
            {isRoundOpen ? (
              <AcceptanceEvaluationForm councilId={councilId} />
            ) : (
              <EmptyState
                icon={Lock}
                title={t("reviewWorkspace.roundNotOpen")}
                description={t("reviewWorkspace.roundNotOpenDesc")}
              />
            )}
          </TabsContent>
        )}

        <TabsContent value="minutes">
          <MinutesPanel councilId={councilId} memberRole={membership.memberRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
