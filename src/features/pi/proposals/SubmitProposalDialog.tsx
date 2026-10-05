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
import { Checkbox } from "@/components/ui/checkbox";
import { useSubmitProposalMutation } from "@/hooks/useProposals";

interface SubmitProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string | null;
  onSubmitted?: () => void;
}

export function SubmitProposalDialog({ open, onOpenChange, proposalId, onSubmitted }: SubmitProposalDialogProps) {
  const { t } = useTranslation();
  const [confirmCv, setConfirmCv] = useState(false);
  const submitMutation = useSubmitProposalMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("proposal.submitTitle")}</DialogTitle>
          <DialogDescription>
            {t("proposal.submitDesc")}
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-2 text-sm text-foreground">
          <Checkbox checked={confirmCv} onCheckedChange={(checked) => setConfirmCv(Boolean(checked))} className="mt-0.5" />
          {t("proposal.cvConfirm")}
        </label>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!confirmCv || !proposalId || submitMutation.isPending}
            onClick={() =>
              proposalId &&
              submitMutation.mutate(
                { id: proposalId, confirmCv },
                {
                  onSuccess: () => {
                    setConfirmCv(false);
                    onOpenChange(false);
                    onSubmitted?.();
                  },
                }
              )
            }
          >
            {submitMutation.isPending && <Loader2 className="animate-spin" />}
            {t("proposal.submitBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
