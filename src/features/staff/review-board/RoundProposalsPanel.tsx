import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CouncilAssignSelect } from "@/features/staff/review-board/CouncilAssignSelect";
import { AddProjectToRoundDialog } from "@/features/staff/review-board/AddProjectToRoundDialog";
import { ROUND_STATUS } from "@/constants/statuses";
import type { ReviewBoardProject, ReviewBoardRound } from "@/types/review-board";

interface RoundProposalsPanelProps {
  round: ReviewBoardRound;
  cycleId: number;
  trackId: number;
  trackProjects: ReviewBoardProject[];
}

export function RoundProposalsPanel({ round, cycleId, trackId, trackProjects }: RoundProposalsPanelProps) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);

  const inRound = new Set(round.projects.map((p) => p.projectId));
  const available = trackProjects.filter((p) => !inRound.has(p.projectId));
  const canAdd = round.status?.toUpperCase() === ROUND_STATUS.PENDING;

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{t("reviewBoard.projectsInRound")}</p>
        {canAdd && available.length > 0 && (
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            {t("reviewBoard.addProject")}
          </Button>
        )}
      </div>

      {round.projects.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("reviewBoard.noProjectsInRound")}</p>
      ) : (
        <ul className="space-y-1.5">
          {round.projects.map((p) => (
            <li key={p.projectId} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground" title={p.titleVi}>
                {p.titleVi}
              </span>
              {p.status && <StatusBadge status={p.status} />}
              <CouncilAssignSelect projectId={p.projectId} councils={round.councils} cycleId={cycleId} trackId={trackId} />
            </li>
          ))}
        </ul>
      )}

      <AddProjectToRoundDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        cycleId={cycleId}
        trackId={trackId}
        roundId={round.id}
        available={available}
      />
    </div>
  );
}
