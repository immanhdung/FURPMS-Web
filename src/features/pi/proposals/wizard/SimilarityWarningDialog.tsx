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
            <div className="flex size-9 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="size-4.5" />
            </div>
            <DialogTitle>Low similarity match ({score}%)</DialogTitle>
          </div>
          <DialogDescription>
            The uploaded file does not appear to match the selected research topic. Do you want to continue
            submission?
          </DialogDescription>
        </DialogHeader>

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
