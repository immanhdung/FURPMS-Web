import { useState } from "react";
import { CheckCircle2, Mail, UserPlus, UserX, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCouncilMembersQuery,
  useRemoveCouncilMemberMutation,
  useRespondMembershipMutation,
} from "@/hooks/useCouncilMembers";
import { useSendInvitationsMutation } from "@/hooks/useCouncils";
import { AddCouncilMemberDialog } from "@/features/staff/proposal-reviews/AddCouncilMemberDialog";
import { formatDateTime } from "@/utils/format";
import type { CouncilMember } from "@/types/council-member";

interface CouncilMembersPanelProps {
  councilId: string;
  trackId?: string | null;
}

export function CouncilMembersPanel({ councilId, trackId }: CouncilMembersPanelProps) {
  const { data: members, isLoading } = useCouncilMembersQuery(councilId);
  const sendInvitationsMutation = useSendInvitationsMutation(councilId);
  const respondMutation = useRespondMembershipMutation(councilId);
  const removeMutation = useRemoveCouncilMemberMutation(councilId);

  const [addOpen, setAddOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<CouncilMember | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Members</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => sendInvitationsMutation.mutate({})} disabled={sendInvitationsMutation.isPending}>
            <Mail />
            Send invitations
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus />
            Add member
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <EmptyState icon={UserX} title="No members yet" description="Add reviewers to this council." className="min-h-32 border-none p-4" />
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.reviewerName ?? member.userId}
                  {member.memberRole && <span className="ml-1.5 text-xs text-muted-foreground">· {member.memberRole}</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.reviewerEmail}</p>
                {member.confirmedAt && (
                  <p className="text-[11px] text-muted-foreground">Confirmed {formatDateTime(member.confirmedAt)}</p>
                )}
                {member.declinedAt && (
                  <p className="text-[11px] text-muted-foreground">Declined {formatDateTime(member.declinedAt)}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {member.status && <StatusBadge status={member.status} />}
                {member.status?.toLowerCase() === "invited" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Mark accepted"
                      aria-label="Mark accepted"
                      onClick={() => respondMutation.mutate({ memberId: member.id, payload: { accept: true } })}
                    >
                      <CheckCircle2 className="text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Mark declined"
                      aria-label="Mark declined"
                      onClick={() => respondMutation.mutate({ memberId: member.id, payload: { accept: false } })}
                    >
                      <XCircle className="text-danger" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon-sm" title="Remove member" aria-label="Remove member" onClick={() => setRemovingMember(member)}>
                  <UserX />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddCouncilMemberDialog open={addOpen} onOpenChange={setAddOpen} councilId={councilId} trackId={trackId} />

      <ConfirmDialog
        open={Boolean(removingMember)}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        title="Remove member"
        description={`Remove ${removingMember?.reviewerName ?? "this member"} from the council?`}
        variant="destructive"
        confirmLabel="Remove"
        isLoading={removeMutation.isPending}
        onConfirm={() =>
          removingMember && removeMutation.mutate(removingMember.id, { onSuccess: () => setRemovingMember(null) })
        }
      />
    </div>
  );
}
