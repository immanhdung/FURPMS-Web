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
import { Input } from "@/components/ui/input";
import { useCloseRoundMutation } from "@/hooks/useReviewRounds";
import type { ReviewRound } from "@/types/review-round";

interface CloseRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  round: ReviewRound | null;
}

export function CloseRoundDialog({ open, onOpenChange, proposalId, round }: CloseRoundDialogProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState("");
  const closeMutation = useCloseRoundMutation(proposalId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("staff.closeRound")}</DialogTitle>
          <DialogDescription>
            {t("staff.closeRoundDesc", { num: round?.roundNumber ?? "" })}
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="round-result" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("staff.result")}
          </label>
          <Input
            id="round-result"
            placeholder={t("staff.resultPlaceholder")}
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={closeMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={closeMutation.isPending}
            onClick={() =>
              round &&
              closeMutation.mutate(
                { roundId: round.id, payload: { result: result || undefined, proposalProjectId: proposalId } },
                {
                  onSuccess: () => {
                    setResult("");
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {closeMutation.isPending && <Loader2 className="animate-spin" />}
            {t("staff.closeRound")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
