import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyMembershipsQuery, useRespondToInvitationMutation } from "@/hooks/useMemberships";
import { MembershipCard } from "@/features/reviewer/shared/MembershipCard";
import { DeclineInvitationDialog } from "@/features/reviewer/invitations/DeclineInvitationDialog";
import { INVITATION_STATUS } from "@/constants/statuses";

export function InvitationsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();
  const respondMutation = useRespondToInvitationMutation();
  const [decliningMemberId, setDecliningMemberId] = useState<string | null>(null);

  // MyMembershipDto has no invitedAt/sentAt timestamp to sort by — the backend returns rows in
  // creation order (oldest first), so reversing approximates "newest first" until it exposes a
  // real timestamp field (same gap as CouncilMemberResponse.invitationSentAt, just missing here).
  const pending = (data ?? []).filter((m) => m.status?.toUpperCase() === INVITATION_STATUS.PENDING).reverse();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reviewer.invitationsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reviewer.invitationsSubtitle")}</p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState icon={Mail} title={t("reviewer.noPending")} description={t("reviewer.allCaughtUp")} />
      ) : (
        <div className="space-y-3">
          {pending.map((membership, index) => (
            <MembershipCard
              key={membership.memberId}
              membership={membership}
              index={index}
              actions={
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDecliningMemberId(membership.memberId)}
                    disabled={respondMutation.isPending}
                  >
                    <X />
                    {t("reviewer.decline")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({ memberId: membership.memberId, payload: { accept: true } })
                    }
                    disabled={respondMutation.isPending}
                  >
                    <Check />
                    {t("reviewer.accept")}
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <DeclineInvitationDialog
        open={Boolean(decliningMemberId)}
        onOpenChange={(open) => !open && setDecliningMemberId(null)}
        memberId={decliningMemberId}
      />
    </div>
  );
}
