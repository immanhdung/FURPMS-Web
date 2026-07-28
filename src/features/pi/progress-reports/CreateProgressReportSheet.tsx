import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitProgressReportMutation, useUpdateProgressReportMutation } from "@/hooks/useProgressReports";
import { formatDate } from "@/utils/format";
import type { ProgressReport } from "@/types/progress-report";

interface CreateProgressReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  /** Kỳ báo cáo (do Staff sinh sẵn theo QĐ543) mà PI đang điền — kỳ/thời gian đã cố định. */
  report: ProgressReport | null;
}

/**
 * PI ĐIỀN nội dung 1 kỳ báo cáo đã được Staff mở sẵn (QĐ543 Điều 10: số kỳ cố định theo loại).
 * Kỳ báo cáo (thời gian) do Staff đặt — ở đây chỉ hiển thị, PI không tự đổi. Lưu nội dung (PUT) rồi
 * nộp (POST /submit) trong 1 thao tác.
 */
export function CreateProgressReportSheet({ open, onOpenChange, contractId, report }: CreateProgressReportSheetProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateProgressReportMutation(contractId);
  const submitMutation = useSubmitProgressReportMutation(contractId);
  const isSubmitting = updateMutation.isPending || submitMutation.isPending;

  const [completedContent, setCompletedContent] = useState("");
  const [pendingContent, setPendingContent] = useState("");
  const [overallCompletionPct, setOverallCompletionPct] = useState("");
  const [expenditureToDate, setExpenditureToDate] = useState("");
  const [nextPeriodPlan, setNextPeriodPlan] = useState("");
  const [piRecommendations, setPiRecommendations] = useState("");

  // Prefill khi mở kỳ khác nhau.
  useEffect(() => {
    if (open && report) {
      setCompletedContent(report.completedContent ?? "");
      setPendingContent(report.pendingContent ?? "");
      setOverallCompletionPct(report.overallCompletionPct != null ? String(report.overallCompletionPct) : "");
      setExpenditureToDate(report.expenditureToDate != null ? String(report.expenditureToDate) : "");
      setNextPeriodPlan(report.nextPeriodPlan ?? "");
      setPiRecommendations(report.piRecommendations ?? "");
    }
  }, [open, report]);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!report) return;
    const payload = {
      completedContent: completedContent || undefined,
      pendingContent: pendingContent || undefined,
      overallCompletionPct: overallCompletionPct ? Number(overallCompletionPct) : undefined,
      expenditureToDate: expenditureToDate ? Number(expenditureToDate) : undefined,
      nextPeriodPlan: nextPeriodPlan || undefined,
      piRecommendations: piRecommendations || undefined,
    };
    // Lưu nội dung trước, rồi nộp (khóa) — nộp xong không sửa được nữa.
    updateMutation.mutate(
      { id: report.id, payload },
      {
        onSuccess: () => {
          submitMutation.mutate(report.id, { onSuccess: () => onOpenChange(false) });
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reports.fillProgress")}
      description={
        report
          ? `${formatDate(report.reportingPeriodStart)} – ${formatDate(report.reportingPeriodEnd)}`
          : t("reports.newProgressHint")
      }
      formId="progress-report-form"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={t("reports.submitReport")}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.completedWork")}</label>
        <Textarea rows={3} value={completedContent} onChange={(e) => setCompletedContent(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.pendingWork")}</label>
        <Textarea rows={3} value={pendingContent} onChange={(e) => setPendingContent(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.overallCompletion")}</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={overallCompletionPct}
            onChange={(e) => setOverallCompletionPct(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.expenditure")}</label>
          <Input type="number" min={0} value={expenditureToDate} onChange={(e) => setExpenditureToDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.nextPeriodPlan")}</label>
        <Textarea rows={3} value={nextPeriodPlan} onChange={(e) => setNextPeriodPlan(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.recommendations")}</label>
        <Textarea rows={2} value={piRecommendations} onChange={(e) => setPiRecommendations(e.target.value)} />
      </div>
    </FormSheet>
  );
}
