import { useEffect, useState } from "react";
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
              <p className="text-sm font-medium text-foreground">Final report</p>
              {status && <StatusBadge status={status} />}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {report.submittedAt && <span>Submitted {formatDateTime(report.submittedAt)}</span>}
              {report.finalSubmittedAt && <span>Final version {formatDateTime(report.finalSubmittedAt)}</span>}
              {report.archivedAt && <span>Archived {formatDateTime(report.archivedAt)}</span>}
              <span>Language: {report.language}</span>
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
                  Full report
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
                  Summary
                </a>
              )}
            </div>

            {report.revisionNotes && (
              <div className="rounded-lg border border-warning/40 bg-warning/5 p-2.5">
                <p className="text-xs font-medium text-warning">Revision requested</p>
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
              {needsRevision ? "Submit the revised report" : "Submit the final report"}
            </p>
            <div>
              <label htmlFor="final-report-url" className="mb-1.5 block text-sm font-medium text-foreground">
                Report file link <span className="text-destructive">*</span>
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
                Summary file link
              </label>
              <Input
                id="final-summary-url"
                placeholder="https://…"
                value={summaryFileUrl}
                onChange={(e) => setSummaryFileUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VI">Vietnamese</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
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
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff: yêu cầu sửa / duyệt khi PI đã nộp; lưu trữ sau khi duyệt. */}
      {canManage && report && !isArchived && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">Review (staff)</p>

            {!isAccepted && (
              <>
                <Textarea
                  rows={2}
                  placeholder="What the PI needs to fix…"
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
                    Request revision
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate(report.id)}
                  >
                    {acceptMutation.isPending ? <Loader2 className="animate-spin" /> : <CircleCheck />}
                    Accept
                  </Button>
                </div>
              </>
            )}

            {isAccepted && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Accepted — archive it to close out the project record.</p>
                <Button
                  type="button"
                  size="sm"
                  disabled={archiveMutation.isPending}
                  onClick={() => archiveMutation.mutate(report.id)}
                >
                  {archiveMutation.isPending ? <Loader2 className="animate-spin" /> : <Archive />}
                  Archive
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!report && !canSubmit && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <FileCheck2 className="size-4" />
          The PI hasn't submitted the final report yet.
        </div>
      )}
    </div>
  );
}
