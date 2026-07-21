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
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDisbursementMutation } from "@/hooks/useDisbursements";

interface ConfirmDisbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  disbursementId: string | null;
  plannedAmount?: number | null;
}

export function ConfirmDisbursementDialog({
  open,
  onOpenChange,
  contractId,
  disbursementId,
  plannedAmount,
}: ConfirmDisbursementDialogProps) {
  const confirmMutation = useConfirmDisbursementMutation(contractId);
  const [actualAmount, setActualAmount] = useState<string>(plannedAmount ? String(plannedAmount) : "");
  const [bankReference, setBankReference] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setActualAmount("");
    setBankReference("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm disbursement</DialogTitle>
          <DialogDescription>Record the actual amount released for this installment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Actual amount</label>
            <Input
              type="number"
              min={0}
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Bank reference</label>
            <Input value={bankReference} onChange={(e) => setBankReference(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={confirmMutation.isPending || !actualAmount}
            onClick={() =>
              disbursementId &&
              confirmMutation.mutate(
                {
                  id: disbursementId,
                  payload: {
                    actualAmount: Number(actualAmount),
                    bankReference: bankReference || undefined,
                    notes: notes || undefined,
                  },
                },
                {
                  onSuccess: () => {
                    reset();
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {confirmMutation.isPending && <Loader2 className="animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
