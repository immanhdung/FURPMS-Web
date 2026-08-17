import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, ClipboardCheck, ExternalLink, FileBarChart, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useGenerateProgressRoundsMutation, useProgressReportQuery, useProgressReportsQuery } from "@/hooks/useProgressReports";
import { ScheduleProgressReportDialog } from "@/features/staff/contracts/ScheduleProgressReportDialog";
import { EvaluateProgressReportDialog } from "@/features/staff/contracts/EvaluateProgressReportDialog";
import { externalUrl, formatDate, formatDateTime } from "@/utils/format";
import { ProgressReportDetailSheet } from "@/components/shared/DossierDetailSheet";

export function ProgressReportsPanel({ contractId }: { contractId: string }) {
  // Chi tiết nạp riêng: danh sách chỉ trả bản tóm tắt, không có nội dung PI đã gõ.
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const { data: openReport } = useProgressReportQuery(openReportId);
  const { t } = useTranslation();
  const { data: reports, isLoading } = useProgressReportsQuery(contractId);
  const generateMutation = useGenerateProgressRoundsMutation(contractId);

  const [schedulingReportId, setSchedulingReportId] = useState<string | null>(null);
  const [evaluatingReportId, setEvaluatingReportId] = useState<string | null>(null);
  const [roundCount, setRoundCount] = useState("");

  return (
    <div className="space-y-3">
      {/* QĐ543 Điều 10 gợi ý Ứng dụng 2 / Cơ bản 1 kỳ, nhưng KHÔNG fix cứng — Staff tự chọn số kỳ
          (thầy 29/07). Bỏ trống → dùng mặc định theo loại đề tài. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label htmlFor="round-count" className="text-xs text-muted-foreground">
          {t("reports.roundCount")}
        </label>
        <Input
          id="round-count"
          type="number"
          min={1}
          max={12}
          className="w-20"
          placeholder={t("reports.auto")}
          value={roundCount}
          onChange={(e) => setRoundCount(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate(roundCount ? Number(roundCount) : undefined)}
          disabled={generateMutation.isPending}
        >
          <CalendarPlus />
          {t("reports.generateRounds")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title={t("reports.noProgressYet")}
          description={t("reports.staffNoProgress")}
          className="min-h-32 border-none p-4"
        />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="space-y-2 rounded-lg border border-border p-3">
              <button
                type="button"
                onClick={() => setOpenReportId(report.id)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("dossier.viewDetail")}
              </button>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {/* Tên đợt Staff đặt; chưa đặt thì hiện "Kỳ {số}". */}
                  {report.roundName || t("reports.roundN", { n: report.reportRound ?? "" })}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
                  </span>
                </p>
                {report.status ? (
                  <StatusBadge status={report.status} />
                ) : !report.submittedAt ? (
                  <span className="text-xs text-muted-foreground">{t("reports.notSubmittedYet")}</span>
                ) : null}
              </div>

              {report.dueDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {t("reports.dueOn", { date: formatDate(report.dueDate) })}
                  {report.scheduledMeetingAt &&
                    ` · ${t("reports.workingSessionAt", { datetime: formatDateTime(report.scheduledMeetingAt) })}`}
                </p>
              )}

              {report.meetingLink && (
                <a
                  href={externalUrl(report.meetingLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("reports.joinLink")}
                </a>
              )}

              {report.evaluationResult && (
                <p className="text-xs text-muted-foreground">
                  {t("reports.evaluationLabel")} <StatusBadge status={report.evaluationResult} />
                  {report.evaluationComments && ` — ${report.evaluationComments}`}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setSchedulingReportId(report.id)}>
                  <CalendarClock />
                  {t("reports.scheduleSession")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEvaluatingReportId(report.id)}>
                  <ClipboardCheck />
                  {t("reports.evaluateReport")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScheduleProgressReportDialog
        open={Boolean(schedulingReportId)}
        onOpenChange={(open) => !open && setSchedulingReportId(null)}
        contractId={contractId}
        reportId={schedulingReportId}
      />
      <EvaluateProgressReportDialog
        open={Boolean(evaluatingReportId)}
        onOpenChange={(open) => !open && setEvaluatingReportId(null)}
        contractId={contractId}
        reportId={evaluatingReportId}
      />
      <ProgressReportDetailSheet
        item={openReport ?? null}
        open={Boolean(openReportId)}
        onOpenChange={(o) => !o && setOpenReportId(null)}
      />
    </div>
  );
}
