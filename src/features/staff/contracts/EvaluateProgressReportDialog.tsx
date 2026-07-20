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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvaluateProgressReportMutation } from "@/hooks/useProgressReports";
import { REVIEW_DECISION } from "@/constants/statuses";

interface EvaluateProgressReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  reportId: string | null;
}

export function EvaluateProgressReportDialog({
  open,
  onOpenChange,
  contractId,
  reportId,
}: EvaluateProgressReportDialogProps) {
  const evaluateMutation = useEvaluateProgressReportMutation(contractId);
  const [evaluationResult, setEvaluationResult] = useState<string>(REVIEW_DECISION.APPROVED);
  const [evaluationComments, setEvaluationComments] = useState("");

  const reset = () => {
    setEvaluationResult(REVIEW_DECISION.APPROVED);
    setEvaluationComments("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Evaluate progress report</DialogTitle>
          <DialogDescription>Record the outcome of this reporting period's review.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Result</label>
            <Select value={evaluationResult} onValueChange={setEvaluationResult}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REVIEW_DECISION.APPROVED}>Approved</SelectItem>
                <SelectItem value={REVIEW_DECISION.REVISION_REQUIRED}>Revision required</SelectItem>
                <SelectItem value={REVIEW_DECISION.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Comments</label>
            <Textarea rows={3} value={evaluationComments} onChange={(e) => setEvaluationComments(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={evaluateMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={evaluateMutation.isPending}
            onClick={() =>
              reportId &&
              evaluateMutation.mutate(
                { id: reportId, payload: { evaluationResult, evaluationComments: evaluationComments || undefined } },
                {
                  onSuccess: () => {
                    reset();
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {evaluateMutation.isPending && <Loader2 className="animate-spin" />}
            Save evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
