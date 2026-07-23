import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Gavel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { cn } from "@/lib/utils";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import { useReviewBoardQuery } from "@/hooks/useReviewBoard";
import { RoundCouncilsPanel } from "@/features/staff/review-board/RoundCouncilsPanel";
import { RoundProposalsPanel } from "@/features/staff/review-board/RoundProposalsPanel";
import { CreateRoundSheet } from "@/features/staff/review-board/CreateRoundSheet";

export function ReviewBoardPage() {
  const { t } = useTranslation();
  const { data: cycles } = useCyclesQuery();
  const [cycleId, setCycleId] = useState<number | undefined>();
  const [trackId, setTrackId] = useState<number | undefined>();
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [createRoundOpen, setCreateRoundOpen] = useState(false);

  const { data: tracks } = useTracksByCycleQuery(cycleId);
  const { data: board, isLoading, isError, refetch, isRefetching } = useReviewBoardQuery(cycleId, trackId);

  const sortedRounds = useMemo(
    () =>
      [...(board?.rounds ?? [])].sort((a, b) => {
        if (a.dimension !== b.dimension) return a.dimension === "SCIENCE" ? -1 : 1;
        return a.roundNumber - b.roundNumber;
      }),
    [board]
  );

  // Vòng đang chọn: theo selectedRoundId nếu còn hợp lệ, không thì vòng đầu.
  const selectedRound = sortedRounds.find((r) => r.id === selectedRoundId) ?? sortedRounds[0];
  const ready = Boolean(cycleId) && Boolean(trackId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reviewBoard.pageTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reviewBoard.pageSubtitle")}</p>
      </div>

      {/* Bộ chọn Đợt + Lĩnh vực */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select
          value={cycleId?.toString()}
          onValueChange={(v) => {
            setCycleId(Number(v));
            setTrackId(undefined);
            setSelectedRoundId(null);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t("reviewBoard.selectCycle")} />
          </SelectTrigger>
          <SelectContent>
            {cycles?.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={trackId?.toString()}
          onValueChange={(v) => {
            setTrackId(Number(v));
            setSelectedRoundId(null);
          }}
          disabled={!cycleId}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t("reviewBoard.selectTrack")} />
          </SelectTrigger>
          <SelectContent>
            {tracks?.map((tr) => (
              <SelectItem key={tr.id} value={tr.id.toString()}>
                {tr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!ready ? (
        <EmptyState icon={Gavel} title={t("reviewBoard.pickTitle")} description={t("reviewBoard.pickDesc")} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <PageLoader label={t("reviewBoard.loading")} />
      ) : (
        <>
          {/* Thanh vòng */}
          <div className="flex flex-wrap items-center gap-2">
            {sortedRounds.map((round) => (
              <button
                key={round.id}
                type="button"
                onClick={() => setSelectedRoundId(round.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  selectedRound?.id === round.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-medium">{t("staff.round", { num: round.roundNumber })}</span>
                <span className="text-xs">{t(`reviewBoard.dim.${round.dimension}`)}</span>
                {round.status && <StatusBadge status={round.status} />}
              </button>
            ))}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setCreateRoundOpen(true)}>
              <Plus className="size-3.5" />
              {t("reviewBoard.newRound")}
            </Button>
          </div>

          {/* Vòng đang chọn: 2 cột */}
          {!selectedRound ? (
            <EmptyState icon={Gavel} title={t("reviewBoard.noRounds")} description={t("reviewBoard.noRoundsDesc")} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm font-semibold text-foreground">
                  {t("staff.round", { num: selectedRound.roundNumber })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(`reviewBoard.dim.${selectedRound.dimension}`)} · {t(`reviewBoard.type.${selectedRound.roundType}`)}
                </span>
                {selectedRound.status && <StatusBadge status={selectedRound.status} />}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <RoundCouncilsPanel round={selectedRound} cycleId={cycleId as number} trackId={trackId as number} />
                <RoundProposalsPanel
                  round={selectedRound}
                  cycleId={cycleId as number}
                  trackId={trackId as number}
                  trackProjects={board?.projects ?? []}
                />
              </div>
            </>
          )}
        </>
      )}

      {ready && (
        <CreateRoundSheet
          open={createRoundOpen}
          onOpenChange={setCreateRoundOpen}
          cycleId={cycleId as number}
          trackId={trackId as number}
        />
      )}
    </div>
  );
}
