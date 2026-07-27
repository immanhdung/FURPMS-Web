import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter(filter)
      .filter((m) =>
        !q ||
        (m.proposalTitleVI ?? "").toLowerCase().includes(q) ||
        (m.piName ?? "").toLowerCase().includes(q) ||
        (m.trackName ?? "").toLowerCase().includes(q)
      )
      // Mới nhất trước (theo ngày tạo hội đồng).
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [data, filter, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={t("reviewer.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
