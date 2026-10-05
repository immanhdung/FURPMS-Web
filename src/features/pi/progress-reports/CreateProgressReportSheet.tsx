import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMultiFileUpload } from "@/hooks/useMultiFileUpload";
import { FileText, Loader2, Upload } from "lucide-react";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useProgressReportDocumentsQuery,
  useProgressReportQuery,
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
  // Một kỳ báo cáo thường kèm cả phụ lục/minh chứng — chọn một lượt thay vì từng tệp.
  const { handleFiles, progress, isUploading } = useMultiFileUpload({
    upload: (file) => uploadMutation.mutateAsync(file),
  });
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
  const [reportFileUrl, setReportFileUrl] = useState("");

  /**
   * Prefill phải lấy từ CHI TIẾT, không phải từ item của danh sách.
   * Danh sách chỉ trả bản TÓM TẮT (%, chi tiêu) — 4 ô nội dung và bảng BM06 không có trong đó.
   * Trước đây mở form sửa thì mấy ô chữ trắng trơn, bấm Nộp là **ghi đè trắng** bài đã nộp.
   */
  const { data: detail } = useProgressReportQuery(open ? (report?.id ?? null) : null);

  useEffect(() => {
    if (!open || !report) return;
    setCompletedContent(detail?.completedContent ?? "");
    setPendingContent(detail?.pendingContent ?? "");
    setOverallCompletionPct(report.overallCompletionPct != null ? String(report.overallCompletionPct) : "");
    setExpenditureToDate(report.expenditureToDate != null ? String(report.expenditureToDate) : "");
    setNextPeriodPlan(detail?.nextPeriodPlan ?? "");
    setPiRecommendations(detail?.piRecommendations ?? "");
    setReportFileUrl(detail?.reportFileUrl ?? report.reportFileUrl ?? "");
    // Bảng hoạt động (BM06) cũng phải nạp lại, không thì nộp lại là mất sạch %.
    if (detail?.items?.length) {
      setItemRates(Object.fromEntries(detail.items.map((i) => [i.activityId, String(i.completionRate)])));
      setItemNotes(Object.fromEntries(detail.items.map((i) => [i.activityId, i.notes ?? ""])));
    }
  }, [open, report, detail]);

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
      reportFileUrl: reportFileUrl.trim() || undefined,
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
    // Lưu nội dung trước, rồi nộp (khoá) — nộp xong không sửa được nữa.
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
            disabled={!report || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {progress ? `${progress.done}/${progress.total}` : t("reports.chooseFiles")}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t("reports.attachFileHint")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {/* Hoặc dán link — file báo cáo có thể rất nặng, ép upload là bất khả thi.
            Chỉ cần CÓ MỘT đường để phòng QLKH xem được bản báo cáo. */}
        <div className="mt-3 border-t border-border pt-3">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {t("reports.orLink")}
          </label>
          <Input
            placeholder={t("reports.orLinkPlaceholder")}
            value={reportFileUrl}
            onChange={(e) => setReportFileUrl(e.target.value)}
          />
        </div>

        {docs && docs.length > 0 && (
          <ul className="mt-2 space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{d.fileName}</span>
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
