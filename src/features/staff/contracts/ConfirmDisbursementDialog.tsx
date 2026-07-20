import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDisbursementMutation } from "@/hooks/useDisbursements";
import { formatCurrency } from "@/utils/format";
import type { Disbursement } from "@/types/disbursement";

interface ConfirmDisbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  disbursement: Disbursement | null;
}

/**
 * Rule #3: hệ thống KHÔNG tự chuyển tiền. Staff chi tiền ngoài hệ thống rồi vào đây
 * ghi nhận lại số tiền thực chi + mã giao dịch ngân hàng.
 */
export function ConfirmDisbursementDialog({
  open,
  onOpenChange,
  contractId,
  disbursement,
}: ConfirmDisbursementDialogProps) {
  const confirmMutation = useConfirmDisbursementMutation(contractId);
  const [actualAmount, setActualAmount] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [notes, setNotes] = useState("");

  // Mặc định điền sẵn số tiền theo kế hoạch — Staff sửa nếu chi khác.
  useEffect(() => {
    if (open && disbursement) {
      setActualAmount(String(disbursement.plannedAmount ?? ""));
      setBankReference("");
      setNotes("");
    }
  }, [open, disbursement]);

  const amountNumber = Number(actualAmount);
  const isAmountValid = actualAmount !== "" && Number.isFinite(amountNumber) && amountNumber > 0;
  const canSubmit = isAmountValid && bankReference.trim().length > 0 && !confirmMutation.isPending;

  const differsFromPlan =
    isAmountValid && disbursement != null && Math.abs(amountNumber - disbursement.plannedAmount) > 0.005;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm disbursement{disbursement ? ` — tranche ${disbursement.roundNumber}` : ""}</DialogTitle>
          <DialogDescription>
            Record a payment that has already been made. The system never transfers money on its own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {disbursement && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planned</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(disbursement.plannedAmount)} ({disbursement.percentage}%)
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{disbursement.conditionDescription}</p>
            </div>
          )}

          <div>
            <label htmlFor="actual-amount" className="mb-1.5 block text-sm font-medium text-foreground">
              Amount actually paid <span className="text-destructive">*</span>
            </label>
            <Input
              id="actual-amount"
              type="number"
              min={0}
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
            />
            {differsFromPlan && (
              <p className="mt-1 text-xs text-warning">This differs from the planned amount — add a note explaining why.</p>
            )}
          </div>

          <div>
            <label htmlFor="bank-reference" className="mb-1.5 block text-sm font-medium text-foreground">
              Bank reference <span className="text-destructive">*</span>
            </label>
            <Input
              id="bank-reference"
              placeholder="Transaction ID from the bank statement"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="disbursement-notes" className="mb-1.5 block text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea id="disbursement-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              disbursement &&
              confirmMutation.mutate(
                {
                  id: disbursement.id,
                  payload: {
                    actualAmount: amountNumber,
                    bankReference: bankReference.trim(),
                    notes: notes.trim() || undefined,
                  },
                },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {confirmMutation.isPending && <Loader2 className="animate-spin" />}
            Confirm payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
