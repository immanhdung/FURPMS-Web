import { useState } from "react";
import { CalendarClock, CalendarPlus, ClipboardCheck, ExternalLink, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCreateProgressReportMutation, useProgressReportsQuery } from "@/hooks/useProgressReports";
import { ScheduleProgressReportDialog } from "@/features/staff/contracts/ScheduleProgressReportDialog";
import { EvaluateProgressReportDialog } from "@/features/staff/contracts/EvaluateProgressReportDialog";
import { formatDate, formatDateTime } from "@/utils/format";

export function ProgressReportsPanel({ contractId }: { contractId: string }) {
  const { data: reports, isLoading } = useProgressReportsQuery(contractId);
  const createMutation = useCreateProgressReportMutation(contractId);

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [schedulingReportId, setSchedulingReportId] = useState<string | null>(null);
  const [evaluatingReportId, setEvaluatingReportId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
        <div className="flex-1 min-w-32">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Period start</label>
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </div>
        <div className="flex-1 min-w-32">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Period end</label>
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
        <Button
          size="sm"
          disabled={!periodStart || !periodEnd || createMutation.isPending}
          onClick={() =>
            createMutation.mutate(
              { reportingPeriodStart: periodStart, reportingPeriodEnd: periodEnd },
              {
                onSuccess: () => {
                  setPeriodStart("");
                  setPeriodEnd("");
                },
              }
            )
          }
        >
          <CalendarPlus />
          New report period
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState icon={FileBarChart} title="No progress report periods yet" className="min-h-32 border-none p-4" />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
                </p>
                {report.status && <StatusBadge status={report.status} />}
              </div>

              {report.dueDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  Due {formatDate(report.dueDate)}
                  {report.scheduledMeetingAt && ` · Meeting ${formatDateTime(report.scheduledMeetingAt)}`}
                </p>
              )}

              {report.meetingLink && (
                <a
                  href={report.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Join link
                </a>
              )}

              {report.evaluationResult && (
                <p className="text-xs text-muted-foreground">
                  Evaluation: <StatusBadge status={report.evaluationResult} />
                  {report.evaluationComments && ` — ${report.evaluationComments}`}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setSchedulingReportId(report.id)}>
                  <CalendarClock />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEvaluatingReportId(report.id)}>
                  <ClipboardCheck />
                  Evaluate
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
    </div>
  );
}
