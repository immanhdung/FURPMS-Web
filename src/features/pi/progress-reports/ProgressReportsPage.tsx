import { useState } from "react";
import { CalendarClock, ExternalLink, FileBarChart, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { useProgressReportsQuery, useSubmitProgressReportMutation } from "@/hooks/useProgressReports";
import { CreateProgressReportSheet } from "@/features/pi/progress-reports/CreateProgressReportSheet";
import { formatDate, formatDateTime } from "@/utils/format";

export function ProgressReportsPage() {
  const { data: contracts, proposalTitleById, isLoading: isContractsLoading } = useMyContractsQuery();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const contractId = selectedContractId ?? contracts?.[0]?.id ?? null;

  const { data: reports, isLoading: isReportsLoading } = useProgressReportsQuery(contractId);
  const submitMutation = useSubmitProgressReportMutation(contractId ?? "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Progress Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Report progress against your signed research contract.
          </p>
        </div>
        {contractId && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            New progress report
          </Button>
        )}
      </div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No contracts yet"
          description="Progress reports become available once you have a signed research contract."
        />
      ) : (
        <>
          <Select value={contractId ?? undefined} onValueChange={setSelectedContractId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select a contract" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.contractNumber || proposalTitleById.get(contract.proposalId) || contract.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isReportsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <EmptyState
              icon={FileBarChart}
              title="No progress reports yet"
              description="Create your first progress report for this contract."
              className="min-h-40"
            />
          ) : (
            <ul className="space-y-2">
              {reports.map((report) => {
                const isSubmitted = Boolean(report.submittedAt);
                return (
                  <li key={report.id} className="space-y-2 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
                      </p>
                      {report.status ? (
                        <StatusBadge status={report.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{isSubmitted ? "Submitted" : "Draft"}</span>
                      )}
                    </div>

                    {report.overallCompletionPct != null && (
                      <p className="text-xs text-muted-foreground">Completion: {report.overallCompletionPct}%</p>
                    )}

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

                    {!isSubmitted && (
                      <Button
                        size="sm"
                        disabled={submitMutation.isPending}
                        onClick={() => submitMutation.mutate(report.id)}
                      >
                        <Send />
                        Submit
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {contractId && (
        <CreateProgressReportSheet open={createOpen} onOpenChange={setCreateOpen} contractId={contractId} />
      )}
    </div>
  );
}
