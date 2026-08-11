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
  useProgressReportQuery,
} from "@/hooks/useProgressReports";
import { ProgressReportDetailView } from "@/components/shared/ProgressReportDetailView";
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

  const { data: report } = useProgressReportQuery(open ? reportId : null);

  /**
   * Thầy 29/07: Staff phải XEM được bản báo cáo rồi mới cho Đạt/Không đạt.
   *
   * "Xem được" = **file upload HOẶC link PI dán**. Cổng này trước chỉ đếm file upload nên PI nộp
   * bằng link (đường mình vừa mở cho họ vì file báo cáo có thể rất nặng) vẫn bị báo "chưa nộp
   * file" và khoá luôn nút chấm — đúng thứ mình vừa cho phép lại chặn ở cửa sau.
   */
  const { data: docs } = useProgressReportDocumentsQuery(reportId);
  const reportLink = report?.reportFileUrl?.trim();
  const hasFile = Boolean((docs && docs.length > 0) || reportLink);

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

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {/* NỘI DUNG PI VIẾT — trước đây dialog này chỉ có ô chấm, Staff không hề thấy
              PI đã điền gì, phải mở file ra đoán. Danh sách chỉ trả bản tóm tắt nên
              phải gọi thêm chi tiết. */}
          <ProgressReportDetailView reportId={open ? reportId : null} />

          {/* File PI nộp — bấm mở xem trước khi chấm. Chưa có file thì khoá nút lưu. */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">{t("contract.reportFiles")}</p>
            {reportLink && (
              <a
                href={/^https?:\/\//i.test(reportLink) ? reportLink : `https://${reportLink}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{reportLink}</span>
              </a>
            )}
            {docs && docs.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {docs.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => openDoc(d.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <FileText className="size-3.5" />
                      {d.fileName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : reportLink ? null : (
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
