import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SimilarityWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  onContinue: () => void;
}

export function SimilarityWarningDialog({ open, onOpenChange, score, onContinue }: SimilarityWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="size-4.5" />
            </div>
            <DialogTitle>Low similarity match</DialogTitle>
          </div>
          <DialogDescription>
            The uploaded file does not appear to match the selected research topic. Do you want to continue
            submission?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 rounded-lg border border-warning/20 bg-warning/5 p-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Similarity score</span>
            <span className="text-warning">{score}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-warning/15">
            <div className="h-full rounded-full bg-warning transition-all duration-300" style={{ width: `${score}%` }} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
