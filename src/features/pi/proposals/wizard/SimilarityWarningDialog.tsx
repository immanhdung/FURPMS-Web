import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="size-4.5" />
            </div>
            <DialogTitle>{t("proposal.similarityTitle", { score })}</DialogTitle>
          </div>
          <DialogDescription>
            {t("proposal.similarityDesc")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
          >
            {t("proposal.continueSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
