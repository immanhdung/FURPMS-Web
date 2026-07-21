import { useState } from "react";
import { ExternalLink, FileCheck2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { useFinalReportQuery, useSubmitFinalReportMutation } from "@/hooks/useFinalReports";
import { formatDateTime } from "@/utils/format";

export function FinalReportsPage() {
  const { data: contracts, proposalTitleById, isLoading: isContractsLoading } = useMyContractsQuery();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const contractId = selectedContractId ?? contracts?.[0]?.id ?? null;

  const { data: finalReport, isLoading: isReportLoading } = useFinalReportQuery(contractId);
  const submitMutation = useSubmitFinalReportMutation(contractId ?? "");

  const [reportFileUrl, setReportFileUrl] = useState("");
  const [summaryFileUrl, setSummaryFileUrl] = useState("");
  const [language, setLanguage] = useState("");

  const canEdit = !finalReport || Boolean(finalReport.revisionNotes);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Final Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">Submit the summary report to close out your contract.</p>
      </div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No contracts yet"
          description="The final report becomes available once you have a signed research contract."
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

          {isReportLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <div className="space-y-4 rounded-xl border border-border p-4">
              {finalReport && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Current submission</p>
                    {finalReport.status && <StatusBadge status={finalReport.status} />}
                  </div>
                  {finalReport.submittedAt && (
                    <p className="text-xs text-muted-foreground">Submitted {formatDateTime(finalReport.submittedAt)}</p>
                  )}
                  {finalReport.reportFileUrl && (
                    <a
                      href={finalReport.reportFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Report file
                    </a>
                  )}
                  {finalReport.revisionNotes && (
                    <p className="text-xs text-warning">Revision requested: {finalReport.revisionNotes}</p>
                  )}
                </div>
              )}

              {canEdit && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {finalReport ? "Resubmit report" : "Submit report"}
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Report file URL</label>
                    <Input value={reportFileUrl} onChange={(e) => setReportFileUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Summary file URL</label>
                    <Input value={summaryFileUrl} onChange={(e) => setSummaryFileUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Language</label>
                    <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Vietnamese / English" />
                  </div>
                  <Button
                    disabled={submitMutation.isPending || !reportFileUrl}
                    onClick={() =>
                      submitMutation.mutate({
                        reportFileUrl: reportFileUrl || undefined,
                        summaryFileUrl: summaryFileUrl || undefined,
                        language: language || undefined,
                      })
                    }
                  >
                    <Send />
                    Submit final report
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
