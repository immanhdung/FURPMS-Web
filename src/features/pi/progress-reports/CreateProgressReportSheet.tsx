import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Upload } from "lucide-react";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useProgressReportDocumentsQuery,
  useProposalActivitiesQuery,
  useSubmitProgressReportMutation,
  useUpdateProgressReportMutation,
  useUploadProgressReportDocMutation,
} from "@/hooks/useProgressReports";
import { formatDate } from "@/utils/format";
import type { ProgressReport } from "@/types/progress-report";

interface CreateProgressReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  /** Để lấy danh sách hoạt động đã cam kết → bảng tiến độ theo hoạt động (BM06). */
  proposalId?: string | null;
  /** Kỳ báo cáo (do Staff sinh sẵn theo QĐ543) mà PI đang điền — kỳ/thời gian đã cố định. */
  report: ProgressReport | null;
}

/**
 * PI ĐIỀN nội dung 1 kỳ báo cáo đã được Staff mở sẵn (QĐ543 Điều 10: số kỳ cố định theo loại).
 * Kỳ báo cáo (thời gian) do Staff đặt — ở đây chỉ hiển thị, PI không tự đổi. Lưu nội dung (PUT) rồi
 * nộp (POST /submit) trong 1 thao tác.
 */
export function CreateProgressReportSheet({ open, onOpenChange, contractId, proposalId, report }: CreateProgressReportSheetProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateProgressReportMutation(contractId);
  const submitMutation = useSubmitProgressReportMutation(contractId);
  const isSubmitting = updateMutation.isPending || submitMutation.isPending;

  // File báo cáo (BM06) — Staff cần mở xem file này rồi mới đánh giá Đạt/Không đạt.
  const { data: docs } = useProgressReportDocumentsQuery(report?.id ?? null);
  const uploadMutation = useUploadProgressReportDocMutation(report?.id ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BM06 — bảng tiến độ theo từng hoạt động đã cam kết trong đề cương.
  const { data: activities } = useProposalActivitiesQuery(proposalId ?? null);
  const [itemRates, setItemRates] = useState<Record<number, string>>({});
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});

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
      // Bảng BM06: chỉ gửi hoạt động PI đã nhập % (bỏ dòng để trống).
      items: (activities ?? [])
        .filter((a) => itemRates[a.id] !== undefined && itemRates[a.id] !== "")
        .map((a) => ({
          activityId: a.id,
          completionRate: Number(itemRates[a.id]),
          completionStatus: Number(itemRates[a.id]) >= 100 ? "COMPLETED" : "IN_PROGRESS",
          notes: itemNotes[a.id] || undefined,
        })),
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
      {/* Đính kèm file báo cáo (BM06) — thầy 29/07: Staff phải xem được file rồi mới đánh giá. */}
      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-foreground">{t("reports.attachFile")}</label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!report || uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            {t("reports.chooseFile")}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t("reports.attachFileHint")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadMutation.mutate(f);
            e.target.value = "";
          }}
        />
        {docs && docs.length > 0 && (
          <ul className="mt-2 space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{d.originalFileName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* BM06 — bảng tiến độ THEO TỪNG HOẠT ĐỘNG đã cam kết (trước đây PI chỉ viết văn xuôi). */}
      {activities && activities.length > 0 && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-sm font-medium text-foreground">{t("reports.activityTable")}</p>
          <p className="mt-0.5 mb-2 text-xs text-muted-foreground">{t("reports.activityTableHint")}</p>
          <ul className="space-y-2">
            {activities.map((a) => (
              <li key={a.id} className="rounded-md border border-border/60 p-2">
                <p className="text-xs font-medium text-foreground">{a.activityName}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    placeholder="%"
                    value={itemRates[a.id] ?? ""}
                    onChange={(e) => setItemRates((p) => ({ ...p, [a.id]: e.target.value }))}
                  />
                  <Input
                    className="min-w-0 flex-1"
                    placeholder={t("reports.activityNote")}
                    value={itemNotes[a.id] ?? ""}
                    onChange={(e) => setItemNotes((p) => ({ ...p, [a.id]: e.target.value }))}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
