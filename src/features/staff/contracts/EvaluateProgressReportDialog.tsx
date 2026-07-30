import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2 } from "lucide-react";
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
import {
  useEvaluateProgressReportMutation,
  useProgressReportDocumentsQuery,
} from "@/hooks/useProgressReports";
import { progressReportDocumentService } from "@/services/api/progress-report-document.service";

/** QĐ543 Điều 10 / BM06 — kết quả đánh giá tiến độ (khớp giá trị BE nhận). */
const PROGRESS_EVAL = { PASS: "PASS", CONDITIONAL: "CONDITIONAL", FAIL: "FAIL" } as const;

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
  const { t } = useTranslation();
  const evaluateMutation = useEvaluateProgressReportMutation(contractId);
  const [evaluationResult, setEvaluationResult] = useState<string>(PROGRESS_EVAL.PASS);
  const [evaluationComments, setEvaluationComments] = useState("");

  // Thầy 29/07: Staff phải XEM được file PI nộp rồi mới cho Đạt/Không đạt.
  const { data: docs } = useProgressReportDocumentsQuery(reportId);
  const hasFile = Boolean(docs && docs.length > 0);

  const openDoc = async (documentId: string) => {
    if (!reportId) return;
    const blob = await progressReportDocumentService.downloadBlob(reportId, documentId);
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  };

  const reset = () => {
    setEvaluationResult(PROGRESS_EVAL.PASS);
    setEvaluationComments("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.evalReportTitle")}</DialogTitle>
          <DialogDescription>{t("contract.evalReportDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* File PI nộp — bấm mở xem trước khi chấm. Chưa có file thì khóa nút lưu. */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">{t("contract.reportFiles")}</p>
            {hasFile ? (
              <ul className="mt-1.5 space-y-1">
                {docs!.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => openDoc(d.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <FileText className="size-3.5" />
                      {d.originalFileName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-destructive">{t("contract.noReportFile")}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.evalResult")}</label>
            <Select value={evaluationResult} onValueChange={setEvaluationResult}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PROGRESS_EVAL.PASS}>{t("contract.evalPass")}</SelectItem>
                <SelectItem value={PROGRESS_EVAL.CONDITIONAL}>{t("contract.evalConditional")}</SelectItem>
                <SelectItem value={PROGRESS_EVAL.FAIL}>{t("contract.evalFail")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.evalComments")}</label>
            <Textarea rows={3} value={evaluationComments} onChange={(e) => setEvaluationComments(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={evaluateMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={evaluateMutation.isPending || !hasFile}
            title={!hasFile ? t("contract.noReportFile") : undefined}
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
            {t("contract.saveEvaluation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
