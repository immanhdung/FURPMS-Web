import { useState } from "react";
import { Loader2, Send } from "lucide-react";
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
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Send className="size-4.5" />
            </div>
            <DialogTitle>Submit proposal</DialogTitle>
          </div>
          <DialogDescription>
            Once submitted, this proposal will move to review and can no longer be edited unless withdrawn.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
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
