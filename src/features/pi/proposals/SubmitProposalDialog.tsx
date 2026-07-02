import { useState } from "react";
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
  const [confirmCv, setConfirmCv] = useState(false);
  const submitMutation = useSubmitProposalMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit proposal</DialogTitle>
          <DialogDescription>
            Once submitted, this proposal will move to review and can no longer be edited unless withdrawn.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-2 text-sm text-foreground">
          <Checkbox checked={confirmCv} onCheckedChange={(checked) => setConfirmCv(Boolean(checked))} className="mt-0.5" />
          I confirm that my CV and profile information are up to date.
        </label>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitMutation.isPending}>
            Cancel
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
            Submit proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
