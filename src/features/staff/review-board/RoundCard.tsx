import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gavel, Lock, Plus, Trash2, Unlock, UserPlus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";
import { AddProjectToRoundDialog } from "@/features/staff/review-board/AddProjectToRoundDialog";
import { CreateCouncilPackageSheet } from "@/features/staff/review-board/CreateCouncilPackageSheet";
import { useDeleteRoundMutation, useOpenBoardRoundMutation, useRemoveProjectFromRoundMutation } from "@/hooks/useReviewBoard";
import { ROUND_STATUS } from "@/constants/statuses";
import type { ReviewBoardProject, ReviewBoardProjectRound, ReviewBoardRound } from "@/types/review-board";

interface RoundCardProps {
  round: ReviewBoardRound;
  cycleId: number;
  trackId: number;
  trackProjects: ReviewBoardProject[];
}

export function RoundCard({ round, cycleId, trackId, trackProjects }: RoundCardProps) {
  const { t } = useTranslation();
  const openMutation = useOpenBoardRoundMutation(cycleId, trackId);
  const deleteMutation = useDeleteRoundMutation(cycleId, trackId);
  const removeProjectMutation = useRemoveProjectFromRoundMutation(cycleId, trackId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [createCouncilOpen, setCreateCouncilOpen] = useState(false);
  const [removingProject, setRemovingProject] = useState<ReviewBoardProjectRound | null>(null);

  const status = round.status?.toUpperCase();
  const canOpen = status === ROUND_STATUS.PENDING;
  const canRemoveProject = status === ROUND_STATUS.PENDING;

  const inRoundIds = new Set(round.projects.map((p) => p.projectId));
  const available = trackProjects.filter((p) => !inRoundIds.has(p.projectId));

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{t("staff.round", { num: round.roundNumber })}</p>
            <Badge variant="secondary">{round.dimension}</Badge>
            <Badge variant="outline">{round.roundType}</Badge>
            {round.status && <StatusBadge status={round.status} />}
          </div>
          <div className="flex items-center gap-1.5">
            {canOpen && (
              <Button size="sm" variant="outline" onClick={() => openMutation.mutate(round.id)} disabled={openMutation.isPending}>
                <Unlock />
                {t("reviewBoard.openRound")}
              </Button>
            )}
            {round.canDelete && (
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                {t("reviewBoard.deleteRound")}
              </Button>
            )}
          </div>
        </div>

        {/* Đề tài trong vòng */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{t("reviewBoard.projectsInRound")}</p>
            {canRemoveProject && available.length > 0 && (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setAddProjectOpen(true)}>
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
                <li key={p.projectId} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.titleVi}</span>
                  {p.status && <StatusBadge status={p.status} />}
                  {canRemoveProject && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("common.remove")}
                      onClick={() => setRemovingProject(p)}
                    >
                      <X />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hội đồng */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{t("reviewBoard.councils")}</p>
            <Button size="sm" onClick={() => setCreateCouncilOpen(true)} disabled={round.projects.length === 0}>
              <Gavel />
              {t("reviewBoard.createCouncil")}
            </Button>
          </div>

          {round.councils.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
              <Lock className="size-3.5 shrink-0" />
              {t("reviewBoard.noCouncilYet")}
            </div>
          ) : (
            <div className="space-y-3">
              {round.councils.map((council, index) => (
                <div key={council.id} className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{t("reviewBoard.councilN", { n: index + 1 })}</p>
                    {council.status && <StatusBadge status={council.status} />}
                    <span className="text-xs text-muted-foreground">
                      {t("reviewBoard.councilProjectCount", { count: council.projectIds.length })}
                    </span>
                  </div>
                  <Tabs defaultValue="members">
                    <TabsList>
                      <TabsTrigger value="members">{t("reviewBoard.members")}</TabsTrigger>
                      <TabsTrigger value="meetings">{t("reviewBoard.meetings")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="members">
                      <CouncilMembersPanel councilId={council.id} />
                    </TabsContent>
                    <TabsContent value="meetings">
                      <MeetingsPanel councilId={council.id} />
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setCreateCouncilOpen(true)} disabled={round.projects.length === 0}>
                <UserPlus className="size-3.5" />
                {t("reviewBoard.addCouncil")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

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

      <ConfirmDialog
        open={Boolean(removingProject)}
        onOpenChange={(o) => !o && setRemovingProject(null)}
        title={t("reviewBoard.removeProjectTitle")}
        description={t("reviewBoard.removeProjectConfirm", { name: removingProject?.titleVi ?? "" })}
        variant="destructive"
        confirmLabel={t("common.remove")}
        isLoading={removeProjectMutation.isPending}
        onConfirm={() =>
          removingProject &&
          removeProjectMutation.mutate(
            { roundId: round.id, projectId: removingProject.projectId },
            { onSuccess: () => setRemovingProject(null) }
          )
        }
      />

      <AddProjectToRoundDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        cycleId={cycleId}
        trackId={trackId}
        roundId={round.id}
        available={available}
      />

      <CreateCouncilPackageSheet
        open={createCouncilOpen}
        onOpenChange={setCreateCouncilOpen}
        cycleId={cycleId}
        trackId={trackId}
        round={round}
      />
    </Card>
  );
}
