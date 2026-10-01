import { useMemo, useState } from "react";
import { roundSessionNo, roundStatusKey } from "@/utils/review-round";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
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
import { RoundRubricPicker } from "@/features/staff/review-board/RoundRubricPicker";
import { SetRoundDeadlineDialog } from "@/features/staff/proposal-reviews/SetRoundDeadlineDialog";
import { RoundTimelineStrip } from "@/features/staff/review-board/RoundTimelineStrip";
import { queryKeys } from "@/services/queryKeys";
import type { ReviewBoardRound } from "@/types/review-board";

export function ReviewBoardPage() {
  const { t } = useTranslation();
  const { data: cycles } = useCyclesQuery();
  // Giữ đợt + lĩnh vực trên URL (?cycle=&track=) → reload/back không mất lựa chọn (trước đây dùng
  // useState cục bộ nên tải lại trang là về màn trống).
  const [searchParams, setSearchParams] = useSearchParams();
  const cycleId = searchParams.get("cycle") ? Number(searchParams.get("cycle")) : undefined;
  const trackId = searchParams.get("track") ? Number(searchParams.get("track")) : undefined;
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [createRoundOpen, setCreateRoundOpen] = useState(false);
  const [deadlineRound, setDeadlineRound] = useState<ReviewBoardRound | null>(null);

  const selectCycle = (v: string) => {
    setSearchParams({ cycle: v }); // đổi đợt → bỏ lĩnh vực cũ
    setSelectedRoundId(null);
  };
  const selectTrack = (v: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("track", v);
      return p;
    });
    setSelectedRoundId(null);
  };

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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <Gavel className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reviewBoard.pageTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("reviewBoard.pageSubtitle")}</p>
        </div>
      </motion.div>

      {/* Bộ chọn Đợt + Lĩnh vực */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={cycleId?.toString()} onValueChange={selectCycle}>
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
          key={cycleId ?? "none"}
          value={trackId?.toString()}
          onValueChange={selectTrack}
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
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all",
                  selectedRound?.id === round.id
                    ? "border-transparent bg-linear-to-r from-primary to-brand-secondary text-white shadow-soft-sm"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {/* Tên = LOẠI + số phiên trong loại đó (01/10) — "Vòng 3" làm người xem tưởng đề tài
                    phải qua 3 vòng. Không hiện "phương diện": rule #16 bỏ FINANCE. */}
                <span className="font-medium">{t(`reviewBoard.type.${round.roundType}`)}</span>
                <span className="text-xs">{t("reviewBoard.session", { n: roundSessionNo(round, sortedRounds) })}</span>
                {round.status && <StatusBadge status={roundStatusKey(round.status)} />}
              </button>
            ))}
            <Button variant="outline" className="h-auto gap-1 rounded-xl px-4 py-2.5" onClick={() => setCreateRoundOpen(true)}>
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
                  {t(`reviewBoard.type.${selectedRound.roundType}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("reviewBoard.session", { n: roundSessionNo(selectedRound, sortedRounds) })}
                </span>
                {selectedRound.status && <StatusBadge status={roundStatusKey(selectedRound.status)} />}
                {/* Bộ tiêu chí riêng cho vòng này — để trống thì dùng bộ theo (đợt + lĩnh vực). */}
                <div className="ml-auto">
                  <RoundRubricPicker round={selectedRound} cycleId={cycleId as number} trackId={trackId as number} />
                </div>
              </div>

              {/* Mốc thời gian của vòng — hiện cho MỌI vòng, kể cả vòng đã chốt (01/10). */}
              <RoundTimelineStrip round={selectedRound} onSetDeadline={setDeadlineRound} />

              <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
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

      <SetRoundDeadlineDialog
        round={deadlineRound}
        invalidateKeys={
          cycleId && trackId ? [queryKeys.reviewBoard.board(cycleId, trackId)] : []
        }
        open={Boolean(deadlineRound)}
        onOpenChange={(open) => !open && setDeadlineRound(null)}
      />

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
