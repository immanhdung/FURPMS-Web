import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvaluateDeliverableMutation } from "@/hooks/useDeliverables";
import { ACCEPTANCE_STATUS, type Deliverable } from "@/types/deliverable";

interface EvaluateDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  deliverable: Deliverable | null;
}

/** Nghiệm thu ĐẠT sẽ mở điều kiện chi tiền cho đợt giải ngân gắn với sản phẩm này (rule #3). */
export function EvaluateDeliverableDialog({
  open,
  onOpenChange,
  contractId,
  deliverable,
}: EvaluateDeliverableDialogProps) {
  const { t } = useTranslation();
  const evaluateMutation = useEvaluateDeliverableMutation(contractId);
  const [acceptanceStatus, setAcceptanceStatus] = useState<string>(ACCEPTANCE_STATUS.PASSED);
  const [qualityAssessment, setQualityAssessment] = useState("");

  useEffect(() => {
    if (open) {
      setAcceptanceStatus(ACCEPTANCE_STATUS.PASSED);
      setQualityAssessment("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.deliverable.evaluateTitle")}</DialogTitle>
          <DialogDescription>{deliverable?.productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.deliverable.result")}</label>
            <Select value={acceptanceStatus} onValueChange={setAcceptanceStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ACCEPTANCE_STATUS.PASSED}>{t("contract.deliverable.passed")}</SelectItem>
                <SelectItem value={ACCEPTANCE_STATUS.FAILED}>{t("contract.deliverable.failed")}</SelectItem>
              </SelectContent>
            </Select>
            {acceptanceStatus === ACCEPTANCE_STATUS.PASSED && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("contract.deliverable.passHint")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="quality-assessment" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.deliverable.assessment")}
            </label>
            <Textarea
              id="quality-assessment"
              rows={3}
              value={qualityAssessment}
              onChange={(e) => setQualityAssessment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={evaluateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={evaluateMutation.isPending}
            onClick={() =>
              deliverable &&
              evaluateMutation.mutate(
                {
                  id: deliverable.id,
                  payload: { acceptanceStatus, qualityAssessment: qualityAssessment.trim() || undefined },
                },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {evaluateMutation.isPending && <Loader2 className="animate-spin" />}
            {t("contract.deliverable.saveEvaluation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
