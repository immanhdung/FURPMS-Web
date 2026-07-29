import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { MembershipCard } from "@/features/reviewer/shared/MembershipCard";
import type { MyMembership } from "@/types/membership";

interface MembershipListPageProps {
  title: string;
  description: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  filter: (membership: MyMembership) => boolean;
  renderActions: (membership: MyMembership) => ReactNode;
}

export function MembershipListPage({
  title,
  description,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  filter,
  renderActions,
}: MembershipListPageProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();
  const items = (data ?? []).filter(filter);

  const EmptyIcon = emptyIcon;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-brand-secondary/10 text-primary">
          <EmptyIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-3">
          {items.map((membership, index) => (
            <MembershipCard key={membership.memberId} membership={membership} index={index} actions={renderActions(membership)} />
          ))}
        </div>
      )}
    </div>
  );
}
