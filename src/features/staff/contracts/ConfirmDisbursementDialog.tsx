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
import { useConfirmDisbursementMutation } from "@/hooks/useDisbursements";
import type { Disbursement } from "@/types/disbursement";

interface ConfirmDisbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  disbursement: Disbursement | null;
}

/**
 * Rule tuần 10 (thầy Đức): hệ thống KHÔNG quản tiền. Kế toán chi tiền ngoài hệ thống; Staff chỉ
 * "đánh dấu đã giải ngân" (cập nhật trạng thái) + đính kèm minh chứng ở danh sách — không nhập số tiền.
 */
export function ConfirmDisbursementDialog({
  open,
  onOpenChange,
  contractId,
  disbursement,
}: ConfirmDisbursementDialogProps) {
  const { t } = useTranslation();
  const confirmMutation = useConfirmDisbursementMutation(contractId);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {disbursement
              ? t("contract.disbursement.markTitle", { n: disbursement.roundNumber })
              : t("contract.disbursement.markDisbursed")}
          </DialogTitle>
          <DialogDescription>{t("contract.disbursement.markDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {disbursement && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{disbursement.conditionDescription}</p>
            </div>
          )}

          <div>
            <label htmlFor="disbursement-notes" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.disbursement.notes")}
            </label>
            <Textarea id="disbursement-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <p className="text-xs text-muted-foreground">{t("contract.disbursement.markEvidenceHint")}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={confirmMutation.isPending}
            onClick={() =>
              disbursement &&
              confirmMutation.mutate(
                { id: disbursement.id, payload: { notes: notes.trim() || undefined } },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {confirmMutation.isPending && <Loader2 className="animate-spin" />}
            {t("contract.disbursement.markDisbursed")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
