import { useState, type ReactNode } from "react";
import { CalendarClock, CheckCircle2, ExternalLink, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useProposalQuery } from "@/hooks/useProposals";
import { useCouncilMembersQuery } from "@/hooks/useCouncilMembers";
import { useCouncilMeetingsQuery } from "@/hooks/useMeetings";
import { useAllScoresQuery } from "@/hooks/useReviewScoring";
import { useFeedbackListQuery } from "@/hooks/useFeedback";
import { useDecisionQuery, useFinalizeDecisionMutation } from "@/hooks/useDecision";
import { useSaveMinutesMutation } from "@/hooks/useMinutes";
import { useAuthStore } from "@/store/auth.store";
import { COUNCIL_MEMBER_ROLE, PROPOSAL_STATUS } from "@/constants/statuses";
import { formatDateTime } from "@/utils/format";
import { DecisionView } from "@/features/reviewer/proposal-review/DecisionView";

interface CouncilMinutesPanelProps {
  councilId: string;
  proposalId: string;
}

function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{value ?? "-"}</div>
    </div>
  );
}

export function CouncilMinutesPanel({ councilId, proposalId }: CouncilMinutesPanelProps) {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data: proposal, isLoading: isProposalLoading } = useProposalQuery(proposalId);
  const { data: members, isLoading: isMembersLoading } = useCouncilMembersQuery(councilId);
  const { data: meetings } = useCouncilMeetingsQuery(councilId);
  const { data: scores } = useAllScoresQuery(councilId);
  const { data: feedbackList } = useFeedbackListQuery(councilId);
  const { data: decision, isLoading: isDecisionLoading } = useDecisionQuery(councilId);

  const saveMinutesMutation = useSaveMinutesMutation(councilId);
  const finalizeMutation = useFinalizeDecisionMutation(councilId);

  const [councilComments, setCouncilComments] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [confirmingResult, setConfirmingResult] = useState<string | null>(null);

  const isLoading = isProposalLoading || isMembersLoading || isDecisionLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Once the chairman has finalized a decision, there's nothing left to compose — show the result.
  if (decision) {
    return <DecisionView councilId={councilId} />;
  }

  const myMembership = members?.find((m) => m.userId === currentUserId);
  const isSecretary = myMembership?.memberRole === COUNCIL_MEMBER_ROLE.SECRETARY;
  const isChairman = myMembership?.memberRole === COUNCIL_MEMBER_ROLE.CHAIRMAN;
  const chairman = members?.find((m) => m.memberRole === COUNCIL_MEMBER_ROLE.CHAIRMAN);
  const secretary = members?.find((m) => m.memberRole === COUNCIL_MEMBER_ROLE.SECRETARY);
  const meeting = meetings?.[0];

  const membersById = new Map((members ?? []).map((m) => [m.userId, m]));

  const handleConfirmDecision = () => {
    if (!confirmingResult) return;
    finalizeMutation.mutate(
      {
        projectId: proposalId,
        result: confirmingResult,
        chairUserId: chairman?.userId,
        secretaryUserId: secretary?.userId,
      },
      { onSuccess: () => setConfirmingResult(null) }
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Meeting minutes (draft)</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Proposal title" value={proposal?.titleVI || proposal?.titleEN} />
          <Field label="Chủ nhiệm đề tài (PI)" value="-" />
          <Field label="Đơn vị chủ trì" value="-" />
          <Field
            label="Meeting time"
            value={meeting ? `${formatDateTime(meeting.scheduledAt)} · ${meeting.durationMinutes}min` : undefined}
          />
        </div>

        <Field
          label="Địa điểm (location)"
          value={
            meeting?.meetingLink ? (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                {meeting.meetingLink}
              </a>
            ) : undefined
          }
        />

        <div>
          <p className="text-xs font-medium text-muted-foreground">Council members</p>
          <ul className="mt-1 space-y-1">
            {members?.map((member) => (
              <li key={member.id} className="text-sm text-foreground">
                {member.reviewerName ?? member.userId}
                {member.memberRole && <span className="text-muted-foreground"> · {member.memberRole}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Scores</p>
          {scores && scores.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {scores.map((score) => {
                const total = score.scoreDetails?.reduce((sum, d) => sum + (d.givenScore || 0), 0) ?? 0;
                const reviewer = score.reviewerId ? membersById.get(score.reviewerId) : undefined;
                return (
                  <li key={score.id} className="text-sm text-foreground">
                    {reviewer?.reviewerName ?? score.reviewerId ?? "Reviewer"}: {total.toFixed(1)}
                    {score.generalComments && (
                      <span className="text-muted-foreground"> — {score.generalComments}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No scores submitted yet.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Reviewer feedback</p>
          {feedbackList && feedbackList.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {feedbackList.map((feedback) => (
                <li key={feedback.id} className="text-sm text-foreground">
                  {feedback.overallAssessment ?? feedback.otherComments ?? "-"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No feedback submitted yet.</p>
          )}
        </div>
      </div>

      {isSecretary && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">Meeting minutes review (Secretary)</p>
            <p className="text-xs text-muted-foreground">
              Review the minutes above, add any notes, then submit. The chairman decides the outcome.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Council comments</label>
              <Textarea rows={3} value={councilComments} onChange={(e) => setCouncilComments(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recommendations</label>
              <Textarea rows={3} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
            </div>
            <Button
              onClick={() =>
                saveMinutesMutation.mutate({ projectId: proposalId, councilComments, recommendations })
              }
              disabled={saveMinutesMutation.isPending}
            >
              Submit minutes
            </Button>
          </CardContent>
        </Card>
      )}

      {isChairman && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">Council decision (Chairman)</p>
            <p className="text-xs text-muted-foreground">
              Review the minutes above, then finalize the council's decision for this proposal.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setConfirmingResult(PROPOSAL_STATUS.APPROVED)}
                disabled={finalizeMutation.isPending}
              >
                <CheckCircle2 />
                Pass
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmingResult(PROPOSAL_STATUS.REJECTED)}
                disabled={finalizeMutation.isPending}
              >
                <XCircle />
                Fail
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isSecretary && !isChairman && (
        <EmptyState
          icon={CalendarClock}
          title="Awaiting council decision"
          description="The secretary will submit the meeting minutes, then the chairman will finalize the decision."
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmingResult)}
        onOpenChange={(open) => !open && setConfirmingResult(null)}
        title={confirmingResult === PROPOSAL_STATUS.APPROVED ? "Pass this proposal?" : "Fail this proposal?"}
        description={
          confirmingResult === PROPOSAL_STATUS.APPROVED
            ? "The proposal will be approved and move forward to contracting."
            : "The proposal will be rejected and the PI will be notified. This ends the process."
        }
        variant={confirmingResult === PROPOSAL_STATUS.APPROVED ? "default" : "destructive"}
        confirmLabel={confirmingResult === PROPOSAL_STATUS.APPROVED ? "Pass" : "Fail"}
        isLoading={finalizeMutation.isPending}
        onConfirm={handleConfirmDecision}
      />
    </div>
  );
}
