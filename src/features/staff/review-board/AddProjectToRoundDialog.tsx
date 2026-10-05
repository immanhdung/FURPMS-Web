import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddProjectToRoundMutation } from "@/hooks/useReviewBoard";
import type { ReviewBoardProject } from "@/types/review-board";

interface AddProjectToRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  trackId: number;
  roundId: string;
  /** Đề tài của lĩnh vực chưa có trong vòng này. */
  available: ReviewBoardProject[];
}

export function AddProjectToRoundDialog({
  open,
  onOpenChange,
  cycleId,
  trackId,
  roundId,
  available,
}: AddProjectToRoundDialogProps) {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState<string | undefined>();
  const addMutation = useAddProjectToRoundMutation(cycleId, trackId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reviewBoard.addProjectTitle")}</DialogTitle>
          <DialogDescription>{t("reviewBoard.addProjectDesc")}</DialogDescription>
        </DialogHeader>

        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("reviewBoard.noAvailableProjects")}</p>
        ) : (
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder={t("reviewBoard.selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {available.map((p) => (
                <SelectItem key={p.projectId} value={p.projectId}>
                  {p.titleVi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!projectId || addMutation.isPending}
            onClick={() =>
              projectId &&
              addMutation.mutate(
                { roundId, projectId },
                {
                  onSuccess: () => {
                    setProjectId(undefined);
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {addMutation.isPending && <Loader2 className="animate-spin" />}
            {t("reviewBoard.addProjectBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
