import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Gavel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import { useReviewBoardQuery } from "@/hooks/useReviewBoard";
import { RoundCard } from "@/features/staff/review-board/RoundCard";
import { CreateRoundSheet } from "@/features/staff/review-board/CreateRoundSheet";

export function ReviewBoardPage() {
  const { t } = useTranslation();
  const { data: cycles } = useCyclesQuery();
  const [cycleId, setCycleId] = useState<number | undefined>();
  const [trackId, setTrackId] = useState<number | undefined>();
  const [createRoundOpen, setCreateRoundOpen] = useState(false);

  const { data: tracks } = useTracksByCycleQuery(cycleId);
  const { data: board, isLoading, isError, refetch, isRefetching } = useReviewBoardQuery(cycleId, trackId);

  // Vòng sắp theo dimension (SCIENCE trước FINANCE) rồi số vòng.
  const sortedRounds = useMemo(() => {
    return [...(board?.rounds ?? [])].sort((a, b) => {
      if (a.dimension !== b.dimension) return a.dimension === "SCIENCE" ? -1 : 1;
      return a.roundNumber - b.roundNumber;
    });
  }, [board]);

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

        <Select value={trackId?.toString()} onValueChange={(v) => setTrackId(Number(v))} disabled={!cycleId}>
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

        {ready && (
          <Button className="ml-auto" onClick={() => setCreateRoundOpen(true)}>
            <Plus />
            {t("reviewBoard.newRound")}
          </Button>
        )}
      </div>

      {!ready ? (
        <EmptyState icon={Gavel} title={t("reviewBoard.pickTitle")} description={t("reviewBoard.pickDesc")} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <PageLoader label={t("reviewBoard.loading")} />
      ) : (
        <>
          {/* Đề tài trong lĩnh vực */}
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                {t("reviewBoard.projectsInTrack", { count: board?.projects.length ?? 0 })}
              </p>
              {(board?.projects.length ?? 0) === 0 ? (
                <p className="text-xs text-muted-foreground">{t("reviewBoard.noTrackProjects")}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {board?.projects.map((p) => (
                    <li key={p.projectId} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-sm">
                      <span className="max-w-56 truncate text-foreground">{p.titleVi}</span>
                      <StatusBadge status={p.projectStatus} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Danh sách vòng */}
          {sortedRounds.length === 0 ? (
            <EmptyState icon={Gavel} title={t("reviewBoard.noRounds")} description={t("reviewBoard.noRoundsDesc")} />
          ) : (
            <div className="space-y-3">
              {sortedRounds.map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  cycleId={cycleId as number}
                  trackId={trackId as number}
                  trackProjects={board?.projects ?? []}
                />
              ))}
            </div>
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
