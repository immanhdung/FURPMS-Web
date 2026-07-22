import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Gavel, Trash2, Unlock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CouncilDetailSheet } from "@/features/staff/review-board/CouncilDetailSheet";
import { CreateCouncilSheet } from "@/features/staff/review-board/CreateCouncilSheet";
import { useDeleteRoundMutation, useOpenBoardRoundMutation } from "@/hooks/useReviewBoard";
import { ROUND_STATUS } from "@/constants/statuses";
import type { ReviewBoardRound } from "@/types/review-board";

interface RoundCouncilsPanelProps {
  round: ReviewBoardRound;
  cycleId: number;
  trackId: number;
}

export function RoundCouncilsPanel({ round, cycleId, trackId }: RoundCouncilsPanelProps) {
  const { t } = useTranslation();
  const openMutation = useOpenBoardRoundMutation(cycleId, trackId);
  const deleteMutation = useDeleteRoundMutation(cycleId, trackId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [manageCouncilId, setManageCouncilId] = useState<string | null>(null);

  const canOpen = round.status?.toUpperCase() === ROUND_STATUS.PENDING;
  const manageIndex = round.councils.findIndex((c) => c.id === manageCouncilId);

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{t("reviewBoard.councils")}</p>
        <div className="flex items-center gap-1.5">
          {canOpen && (
            <Button size="sm" variant="outline" onClick={() => openMutation.mutate(round.id)} disabled={openMutation.isPending}>
              <Unlock />
              {t("reviewBoard.openRound")}
            </Button>
          )}
          {round.canDelete && (
            <Button size="icon-sm" variant="ghost" className="text-danger" aria-label={t("reviewBoard.deleteRound")} onClick={() => setConfirmDelete(true)}>
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {round.councils.length === 0 ? (
        <p className="mb-2 text-xs text-muted-foreground">{t("reviewBoard.noCouncilYet")}</p>
      ) : (
        <ul className="mb-2 space-y-1.5">
          {round.councils.map((council, index) => (
            <li key={council.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{t("reviewBoard.councilN", { n: index + 1 })}</span>
                {council.status && <StatusBadge status={council.status} />}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {council.members.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("reviewBoard.councilProjectCount", { count: council.projectIds.length })}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 shrink-0 gap-1 text-xs" onClick={() => setManageCouncilId(council.id)}>
                {t("reviewBoard.manage")}
                <ChevronRight className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setCreateOpen(true)}>
        <Gavel className="size-3.5" />
        {t("reviewBoard.createCouncil")}
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("reviewBoard.deleteRound")}
        description={t("reviewBoard.deleteRoundConfirm", { num: round.roundNumber })}
        variant="destructive"
        confirmLabel={t("common.delete")}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(round.id, { onSuccess: () => setConfirmDelete(false) })}
      />

      <CreateCouncilSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        cycleId={cycleId}
        trackId={trackId}
        roundId={round.id}
        roundNumber={round.roundNumber}
      />

      <CouncilDetailSheet
        open={Boolean(manageCouncilId)}
        onOpenChange={(o) => !o && setManageCouncilId(null)}
        councilId={manageCouncilId}
        title={manageIndex >= 0 ? t("reviewBoard.councilN", { n: manageIndex + 1 }) : t("reviewBoard.councils")}
      />
    </div>
  );
}
