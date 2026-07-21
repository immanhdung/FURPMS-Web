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
  // MyMembershipDto has no timestamp field to sort by — the backend returns rows in creation
  // order (oldest first), so reversing approximates "newest first" until it exposes a real one.
  const items = (data ?? []).filter(filter).reverse();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
