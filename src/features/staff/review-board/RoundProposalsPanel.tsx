import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CouncilAssignSelect } from "@/features/staff/review-board/CouncilAssignSelect";
import { useAddProjectToRoundMutation } from "@/hooks/useReviewBoard";
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
  const addMutation = useAddProjectToRoundMutation(cycleId, trackId);

  const inRound = new Set(round.projects.map((p) => p.projectId));
  // Đề tài ĐÃ NỘP trong lĩnh vực nhưng chưa vào vòng này (kể cả nộp trễ sau khi vòng chạy).
  // Với vòng XÉT DUYỆT: chỉ hiện đề tài CHƯA qua duyệt (PROPOSED/UNDER_REVIEW) — bỏ đề tài đã
  // APPROVED/đang nghiệm thu (vd abc2) khỏi lỡ tay xét lại. Vòng khác (nghiệm thu) giữ nguyên.
  const isReview = round.roundType?.toUpperCase() === "REVIEW";
  const reviewable = ["PROPOSED", "UNDER_REVIEW"];
  const available = trackProjects.filter(
    (p) => !inRound.has(p.projectId) && (!isReview || reviewable.includes((p.projectStatus ?? "").toUpperCase()))
  );
  // Chỉ thêm được vào vòng còn PENDING/OPEN (rule #17). Vòng đã PASSED/CLOSED → chỉ hiện để biết.
  const status = round.status?.toUpperCase();
  const canAdd = status === ROUND_STATUS.PENDING || status === ROUND_STATUS.OPEN;

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="mb-2 text-sm font-medium text-foreground">{t("reviewBoard.projectsInRound")}</p>

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

      {/* Đề tài đã nộp trong lĩnh vực nhưng CHƯA vào vòng — LUÔN hiện để thấy hết, không phải tự mò. */}
      {available.length > 0 && (
        <div className="mt-3 border-t border-border pt-2.5">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {t("reviewBoard.availableProjects", { n: available.length })}
            {!canAdd && ` · ${t("reviewBoard.roundClosedHint")}`}
          </p>
          <ul className="space-y-1.5">
            {available.map((p) => (
              <li
                key={p.projectId}
                className="flex items-center gap-2 rounded-lg border border-dashed border-border px-2.5 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-foreground" title={p.titleVi}>
                  {p.titleVi}
                </span>
                {p.projectStatus && <StatusBadge status={p.projectStatus} />}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 gap-1 text-xs"
                  disabled={!canAdd || addMutation.isPending}
                  title={canAdd ? t("reviewBoard.addProject") : t("reviewBoard.roundClosedHint")}
                  onClick={() => addMutation.mutate({ roundId: round.id, projectId: p.projectId })}
                >
                  <Plus className="size-3.5" />
                  {t("reviewBoard.addProject")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
