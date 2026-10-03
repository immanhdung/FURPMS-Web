import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Archive, CircleCheck, ExternalLink, FileCheck2, Loader2, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import {
  useAcceptFinalReportMutation,
  useArchiveFinalReportMutation,
  useReopenFinalReportMutation,
  useFinalReportQuery,
  useRequestFinalReportRevisionMutation,
  useSubmitFinalReportMutation,
} from "@/hooks/useFinalReports";
import { finalReportDocumentService } from "@/services/api/final-report-document.service";
import { openDocumentLocation } from "@/services/api/fileDownload";
import { FINAL_REPORT_STATUS } from "@/types/final-report";
import { formatDate, formatDateTime } from "@/utils/format";
import { ReasonDialog } from "@/components/shared/ReasonDialog";

/** Ngày yyyy-MM-dd cộng/trừ n ngày — chỉ để hiện hạn gợi ý, không dùng tính toán nghiệp vụ. */
function shiftDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Báo cáo tổng kết: PI nộp → Staff yêu cầu sửa / duyệt → lưu trữ.
 * Chỉ có 1 báo cáo cho mỗi hợp đồng; nộp lại sẽ ghi đè bản cũ.
 */
/**
 * Báo cáo tổng kết (BM09).
 *
 * `canSubmitReport` mặc định FALSE: theo QĐ543 người nộp BM09 là **PI**, không phải Staff.
 * Panel này đang nhúng trong màn Hợp đồng của Staff, mà trước đây vẫn hiện form "Nộp báo
 * cáo tổng kết" ⇒ Staff nộp hộ PI, sai vai. Staff chỉ XEM + yêu cầu chỉnh sửa.
 */
export function FinalReportPanel({
  contractId,
  canManage,
  canSubmitReport = false,
  contractEndDate,
  projectStatus,
}: {
  contractId: string;
  canManage: boolean;
  canSubmitReport?: boolean;
  /** Để báo hạn nộp (30 ngày trước ngày kết thúc — Điều 11.2.a) ngay cả khi PI chưa nộp gì. */
  contractEndDate?: string | null;
  /** Lưu trữ chỉ làm được SAU nghiệm thu Đạt (Điều 13.1) — đề tài COMPLETED. */
  projectStatus?: string | null;
}) {
  const { t } = useTranslation();
  const { data: report, isLoading } = useFinalReportQuery(contractId);
  const submitMutation = useSubmitFinalReportMutation(contractId);
  const revisionMutation = useRequestFinalReportRevisionMutation(contractId);
  const acceptMutation = useAcceptFinalReportMutation(contractId);
  const archiveMutation = useArchiveFinalReportMutation(contractId);
  const reopenMutation = useReopenFinalReportMutation(contractId);
  const [reopening, setReopening] = useState(false);
  const acceptancePassed = projectStatus === "COMPLETED";

  const [reportFileUrl, setReportFileUrl] = useState("");
  const [summaryFileUrl, setSummaryFileUrl] = useState("");
  const [language, setLanguage] = useState("VI");
  const [revisionNotes, setRevisionNotes] = useState("");

  // Upload file thật (BM09) — lấy downloadUrl của hệ thống làm reportFileUrl/summaryFileUrl.
  const [uploading, setUploading] = useState<"report" | "summary" | null>(null);
  const [reportFileName, setReportFileName] = useState("");
  const [summaryFileName, setSummaryFileName] = useState("");
  const reportInputRef = useRef<HTMLInputElement>(null);
  const summaryInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, kind: "report" | "summary") => {
    setUploading(kind);
    try {
      const doc = await finalReportDocumentService.upload(contractId, file);
      const url = doc.downloadUrl ?? "";
      if (kind === "report") {
        setReportFileUrl(url);
        setReportFileName(doc.fileName);
      } else {
        setSummaryFileUrl(url);
        setSummaryFileName(doc.fileName);
      }
      toast.success(t("contract.finalReport.uploaded"));
    } catch {
      toast.error(t("contract.finalReport.uploadFailed"));
    } finally {
      setUploading(null);
    }
  };

  const openDocument = async (location: string) => {
    try {
      await openDocumentLocation(location);
    } catch {
      toast.error(t("reports.openFileFailed"));
    }
  };

  useEffect(() => {
    if (report) {
      setReportFileUrl(report.reportFileUrl ?? "");
      setSummaryFileUrl(report.summaryFileUrl ?? "");
      setLanguage(report.language ?? "VI");
    }
  }, [report]);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const status = report?.status;
  const isArchived = status === FINAL_REPORT_STATUS.ARCHIVED;
  const isAccepted = status === FINAL_REPORT_STATUS.ACCEPTED;
  const needsRevision = status === FINAL_REPORT_STATUS.REVISION_REQUIRED;
  // Nộp được khi: chưa nộp lần nào, hoặc bị trả về sửa. Đã duyệt/lưu trữ thì khoá.
  const canSubmit = canSubmitReport && (!report || needsRevision);

  return (
    <div className="space-y-4">
      {report && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{t("contract.finalReport.title")}</p>
              <div className="flex items-center gap-2">
                {/* Hai hạn nối tiếp nhau, mỗi lúc chỉ một cái còn ý nghĩa:
                    - chưa nộp bản cuối → hạn nộp (QĐ543 Điều 11.2.a, trước ngày kết thúc đề tài);
                    - nộp rồi mà chưa lưu trữ → hạn lưu trữ hồ sơ.
                    Trước 25/08 cả hai chỉ nằm trong DTO, không màn nào đọc ra. */}
                {!report.finalSubmittedAt && report.deadline && (
                  <DeadlineBadge
                    deadline={report.deadline}
                    daysLeft={report.daysLeft}
                    basis={t("contract.finalReport.deadlineBasis")}
                  />
                )}
                {report.finalSubmittedAt && !report.archivedAt && report.archivalDeadline && (
                  <DeadlineBadge
                    deadline={report.archivalDeadline}
                    daysLeft={report.archivalDaysLeft}
                    basis={t("contract.finalReport.archivalDeadlineBasis")}
                  />
                )}
                {status && <StatusBadge status={status} />}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {report.submittedAt && (
                <span>{t("contract.finalReport.submittedAt", { date: formatDateTime(report.submittedAt) })}</span>
              )}
              {report.finalSubmittedAt && (
                <span>{t("contract.finalReport.finalVersion", { date: formatDateTime(report.finalSubmittedAt) })}</span>
              )}
              {report.archivedAt && (
                <span>{t("contract.finalReport.archivedAt", { date: formatDateTime(report.archivedAt) })}</span>
              )}
              <span>
                {t("contract.finalReport.language")}: {report.language}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {report.reportFileUrl && (
                <button
                  type="button"
                  onClick={() => void openDocument(report.reportFileUrl!)}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("contract.finalReport.fullReport")}
                </button>
              )}
              {report.summaryFileUrl && (
                <button
                  type="button"
                  onClick={() => void openDocument(report.summaryFileUrl!)}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("contract.finalReport.summary")}
                </button>
              )}
            </div>

            {report.revisionNotes && (
              <div className="rounded-lg border border-warning/40 bg-warning/5 p-2.5">
                <p className="text-xs font-medium text-warning">{t("contract.finalReport.revisionRequested")}</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{report.revisionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {canSubmit && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">
              {needsRevision ? t("contract.finalReport.submitRevised") : t("contract.finalReport.submitTitle")}
            </p>
            {/* Ưu tiên upload để file đi qua kho có phân quyền; vẫn nhận link ngoài khi tài liệu
                đã nằm trên Drive/kho cơ quan để PI không phải tải xuống rồi tải lên lại. */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("contract.finalReport.reportFile")} <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading !== null}
                  onClick={() => reportInputRef.current?.click()}
                >
                  {uploading === "report" ? <Loader2 className="animate-spin" /> : <Upload />}
                  {t("reports.chooseFile")}
                </Button>
                {reportFileUrl && (
                  <span className="truncate text-xs text-muted-foreground">{reportFileName || reportFileUrl}</span>
                )}
              </div>
              <input
                ref={reportInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "report");
                  e.target.value = "";
                }}
              />
              <p className="my-1 text-center text-xs text-muted-foreground">{t("reports.orPasteLink")}</p>
              <Input
                type="url"
                placeholder="https://drive.google.com/..."
                value={reportFileUrl.startsWith("/api/") ? "" : reportFileUrl}
                onChange={(event) => setReportFileUrl(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("contract.finalReport.summaryFile")}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading !== null}
                  onClick={() => summaryInputRef.current?.click()}
                >
                  {uploading === "summary" ? <Loader2 className="animate-spin" /> : <Upload />}
                  {t("reports.chooseFile")}
                </Button>
                {summaryFileUrl && (
                  <span className="truncate text-xs text-muted-foreground">{summaryFileName || summaryFileUrl}</span>
                )}
              </div>
              <input
                ref={summaryInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "summary");
                  e.target.value = "";
                }}
              />
              <p className="my-1 text-center text-xs text-muted-foreground">{t("reports.orPasteLink")}</p>
              <Input
                type="url"
                placeholder="https://drive.google.com/..."
                value={summaryFileUrl.startsWith("/api/") ? "" : summaryFileUrl}
                onChange={(event) => setSummaryFileUrl(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("contract.finalReport.language")}
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VI">{t("contract.finalReport.langVI")}</SelectItem>
                  <SelectItem value="EN">{t("contract.finalReport.langEN")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!reportFileUrl.trim() || submitMutation.isPending}
                onClick={() =>
                  submitMutation.mutate({
                    reportFileUrl: reportFileUrl.trim(),
                    summaryFileUrl: summaryFileUrl.trim() || undefined,
                    language,
                  })
                }
              >
                {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
                {t("common.submit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff: yêu cầu sửa / duyệt khi PI đã nộp; lưu trữ sau khi duyệt. */}
      {canManage && report && !isArchived && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">{t("contract.finalReport.reviewStaff")}</p>

            {!isAccepted && (
              <>
                <Textarea
                  rows={2}
                  placeholder={t("contract.finalReport.revisionPlaceholder")}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!revisionNotes.trim() || revisionMutation.isPending}
                    onClick={() =>
                      revisionMutation.mutate(
                        { id: report.id, revisionNotes: revisionNotes.trim() },
                        { onSuccess: () => setRevisionNotes("") },
                      )
                    }
                  >
                    {revisionMutation.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                    {t("contract.finalReport.requestRevision")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate(report.id)}
                  >
                    {acceptMutation.isPending ? <Loader2 className="animate-spin" /> : <CircleCheck />}
                    {t("contract.finalReport.accept")}
                  </Button>
                </div>
              </>
            )}

            {isAccepted && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {acceptancePassed
                    ? t("contract.finalReport.acceptedHint")
                    : t("contract.finalReport.archiveAfterAcceptance")}
                </p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setReopening(true)}>
                    <RotateCcw />
                    {t("reports.reopen")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={archiveMutation.isPending || !acceptancePassed}
                    onClick={() => archiveMutation.mutate(report.id)}
                  >
                    {archiveMutation.isPending ? <Loader2 className="animate-spin" /> : <Archive />}
                    {t("contract.finalReport.archive")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Đã lưu trữ mà sai sót (lưu nhầm, cần thay bản) — vẫn mở lại được, kèm lý do. */}
      {canManage && isArchived && report && (
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="ghost" onClick={() => setReopening(true)}>
            <RotateCcw />
            {t("reports.reopen")}
          </Button>
        </div>
      )}

      {/* Staff KHÔNG phải tạo gì: chủ nhiệm tự nộp BM09 ở mục "Báo cáo tổng kết"; hạn suy từ ngày kết
          thúc hợp đồng. Trước 03/10 chỗ này chỉ có một dòng "PI chưa nộp", trống trơn. */}
      {!report && !canSubmit && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <FileCheck2 className="size-4" />
            {t("contract.finalReport.notSubmitted")}
          </p>
          {contractEndDate && (
            <p className="text-xs">
              {t("contract.finalReport.dueHint", { date: formatDate(shiftDays(contractEndDate, -30)) })}
            </p>
          )}
          <p className="text-xs">{t("contract.finalReport.dossierHint")}</p>
        </div>
      )}

      <ReasonDialog
        open={reopening}
        onOpenChange={setReopening}
        title={t("contract.finalReport.reopenTitle")}
        description={t("contract.finalReport.reopenDescription")}
        confirmLabel={t("reports.reopen")}
        isLoading={reopenMutation.isPending}
        onConfirm={(reason) =>
          report && reopenMutation.mutate({ id: report.id, reason }, { onSuccess: () => setReopening(false) })
        }
      />
    </div>
  );
}
