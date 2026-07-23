import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Archive, CircleCheck, ExternalLink, FileCheck2, Loader2, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAcceptFinalReportMutation,
  useArchiveFinalReportMutation,
  useFinalReportQuery,
  useRequestFinalReportRevisionMutation,
  useSubmitFinalReportMutation,
} from "@/hooks/useFinalReports";
import { FINAL_REPORT_STATUS } from "@/types/final-report";
import { formatDateTime } from "@/utils/format";

/**
 * Báo cáo tổng kết: PI nộp → Staff yêu cầu sửa / duyệt → lưu trữ.
 * Chỉ có 1 báo cáo cho mỗi hợp đồng; nộp lại sẽ ghi đè bản cũ.
 */
export function FinalReportPanel({ contractId, canManage }: { contractId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const { data: report, isLoading } = useFinalReportQuery(contractId);
  const submitMutation = useSubmitFinalReportMutation(contractId);
  const revisionMutation = useRequestFinalReportRevisionMutation(contractId);
  const acceptMutation = useAcceptFinalReportMutation(contractId);
  const archiveMutation = useArchiveFinalReportMutation(contractId);

  const [reportFileUrl, setReportFileUrl] = useState("");
  const [summaryFileUrl, setSummaryFileUrl] = useState("");
  const [language, setLanguage] = useState("VI");
  const [revisionNotes, setRevisionNotes] = useState("");

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
  // Nộp được khi: chưa nộp lần nào, hoặc bị trả về sửa. Đã duyệt/lưu trữ thì khóa.
  const canSubmit = !report || needsRevision;

  return (
    <div className="space-y-4">
      {report && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{t("contract.finalReport.title")}</p>
              {status && <StatusBadge status={status} />}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {report.submittedAt && <span>{t("contract.finalReport.submittedAt", { date: formatDateTime(report.submittedAt) })}</span>}
              {report.finalSubmittedAt && <span>{t("contract.finalReport.finalVersion", { date: formatDateTime(report.finalSubmittedAt) })}</span>}
              {report.archivedAt && <span>{t("contract.finalReport.archivedAt", { date: formatDateTime(report.archivedAt) })}</span>}
              <span>{t("contract.finalReport.language")}: {report.language}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {report.reportFileUrl && (
                <a
                  href={report.reportFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("contract.finalReport.fullReport")}
                </a>
              )}
              {report.summaryFileUrl && (
                <a
                  href={report.summaryFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("contract.finalReport.summary")}
                </a>
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
            <div>
              <label htmlFor="final-report-url" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("contract.finalReport.reportFile")} <span className="text-destructive">*</span>
              </label>
              <Input
                id="final-report-url"
                placeholder="https://…"
                value={reportFileUrl}
                onChange={(e) => setReportFileUrl(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="final-summary-url" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("contract.finalReport.summaryFile")}
              </label>
              <Input
                id="final-summary-url"
                placeholder="https://…"
                value={summaryFileUrl}
                onChange={(e) => setSummaryFileUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.finalReport.language")}</label>
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
                        { onSuccess: () => setRevisionNotes("") }
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{t("contract.finalReport.acceptedHint")}</p>
                <Button
                  type="button"
                  size="sm"
                  disabled={archiveMutation.isPending}
                  onClick={() => archiveMutation.mutate(report.id)}
                >
                  {archiveMutation.isPending ? <Loader2 className="animate-spin" /> : <Archive />}
                  {t("contract.finalReport.archive")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!report && !canSubmit && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <FileCheck2 className="size-4" />
          {t("contract.finalReport.notSubmitted")}
        </div>
      )}
    </div>
  );
}
