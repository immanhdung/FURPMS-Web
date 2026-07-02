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
  const [result, setResult] = useState("");
  const closeMutation = useCloseRoundMutation(proposalId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close round</DialogTitle>
          <DialogDescription>
            Record the outcome for Round {round?.roundNumber}. This closes it to further scoring.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="round-result" className="mb-1.5 block text-sm font-medium text-foreground">
            Result
          </label>
          <Input
            id="round-result"
            placeholder="e.g. APPROVED, REJECTED, REVISION_REQUIRED"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={closeMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={closeMutation.isPending}
            onClick={() =>
              round &&
              closeMutation.mutate(
                { roundId: round.id, payload: { result: result || undefined } },
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
            Close round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
