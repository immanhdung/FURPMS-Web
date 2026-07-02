import { Link } from "react-router-dom";
import { Check, Mail, X } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyMembershipsQuery, useRespondToInvitationMutation } from "@/hooks/useMemberships";
import { INVITATION_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function ReviewerLiveQueueCard() {
  const { data, isLoading } = useMyMembershipsQuery();
  const respondMutation = useRespondToInvitationMutation();

  const pending = (data ?? []).filter((m) => m.status?.toUpperCase() === INVITATION_STATUS.PENDING).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Pending Invitations</CardTitle>
        <CardAction>
          <Link to={ROUTES.INVITATIONS} className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState icon={Mail} title="No pending invitations" className="min-h-32 border-none p-0" />
        ) : (
          <ul className="space-y-2">
            {pending.map((membership) => (
              <li key={membership.memberId} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                <p className="min-w-0 truncate text-xs font-medium text-foreground">
                  {membership.proposalTitleVI || "Untitled proposal"}
                </p>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Decline invitation"
                    onClick={() =>
                      respondMutation.mutate({ memberId: membership.memberId, payload: { accept: false } })
                    }
                  >
                    <X className="text-danger" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Accept invitation"
                    onClick={() =>
                      respondMutation.mutate({ memberId: membership.memberId, payload: { accept: true } })
                    }
                  >
                    <Check className="text-success" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
