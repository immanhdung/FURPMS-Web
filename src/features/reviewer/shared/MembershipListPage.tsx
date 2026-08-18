import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  filter,
  renderActions,
}: MembershipListPageProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();
  const [search, setSearch] = useState("");
  const [cycle, setCycle] = useState("all");
  const [track, setTrack] = useState("all");
  const [status, setStatus] = useState("all");
  const [roundType, setRoundType] = useState("all");

  const filterOptions = useMemo(() => {
    const source = (data ?? []).filter(filter);
    const unique = <T extends string | number>(values: Array<T | null | undefined>) =>
      Array.from(new Set(values.filter((value): value is T => value !== null && value !== undefined && value !== "")));

    return {
      cycles: unique(source.map((m) => m.cycleCode)).sort(),
      tracks: unique(source.map((m) => m.trackName)).sort(),
      statuses: unique(source.map((m) => m.proposalStatus)).sort(),
      roundTypes: unique(source.map((m) => m.roundType)).sort(),
    };
  }, [data, filter]);

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
      .filter((m) => cycle === "all" || m.cycleCode === cycle)
      .filter((m) => track === "all" || m.trackName === track)
      .filter((m) => status === "all" || m.proposalStatus === status)
      .filter((m) => roundType === "all" || m.roundType === roundType)
      // Mới nhất trước (theo ngày tạo hội đồng).
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [cycle, data, filter, roundType, search, status, track]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent-2/15 to-primary/10 text-brand-accent-2">
          <EmptyIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </motion.div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,1.5fr)_repeat(4,minmax(9rem,1fr))]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t("reviewer.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={cycle} onValueChange={setCycle}>
          <SelectTrigger aria-label={t("reviewer.filterCycle")}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reviewer.allCycles")}</SelectItem>
            {filterOptions.cycles.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={track} onValueChange={setTrack}>
          <SelectTrigger aria-label={t("reviewer.filterTrack")}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reviewer.allTracks")}</SelectItem>
            {filterOptions.tracks.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label={t("reviewer.filterStatus")}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reviewer.allStatuses")}</SelectItem>
            {filterOptions.statuses.map((value) => (
              <SelectItem key={value} value={value}>{t(`status.${value}`, { defaultValue: value })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roundType} onValueChange={setRoundType}>
          <SelectTrigger aria-label={t("reviewer.filterRound")}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reviewer.allRounds")}</SelectItem>
            {filterOptions.roundTypes.map((value) => (
              <SelectItem key={value} value={value}>{t(`reviewBoard.type.${value}`, { defaultValue: value })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <EmptyState icon={EmptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-3">
          {items.map((membership, index) => (
            <MembershipCard key={`${membership.memberId}:${membership.projectId}`} membership={membership} index={index} actions={renderActions(membership)} />
          ))}
        </div>
      )}
    </div>
  );
}
