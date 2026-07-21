import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reports.finalTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reports.finalSubtitle")}</p>
      </div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={t("reports.noContracts")}
          description={t("reports.finalNoContractsDesc")}
        />
      ) : (
        <>
          <Select value={contractId ?? undefined} onValueChange={setSelectedContractId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder={t("reports.selectContract")} />
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
                    <p className="text-sm font-medium text-foreground">{t("reports.currentSubmission")}</p>
                    {finalReport.status && <StatusBadge status={finalReport.status} />}
                  </div>
                  {finalReport.submittedAt && (
                    <p className="text-xs text-muted-foreground">{t("reports.submittedAt", { at: formatDateTime(finalReport.submittedAt) })}</p>
                  )}
                  {finalReport.reportFileUrl && (
                    <a
                      href={finalReport.reportFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      {t("reports.reportFile")}
                    </a>
                  )}
                  {finalReport.revisionNotes && (
                    <p className="text-xs text-warning">{t("reports.revisionRequested", { notes: finalReport.revisionNotes })}</p>
                  )}
                </div>
              )}

              {canEdit && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {finalReport ? t("reports.resubmitReport") : t("reports.submitReport")}
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.reportFileUrl")}</label>
                    <Input value={reportFileUrl} onChange={(e) => setReportFileUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.summaryFileUrl")}</label>
                    <Input value={summaryFileUrl} onChange={(e) => setSummaryFileUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.language")}</label>
                    <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder={t("reports.langPlaceholder")} />
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
                    {t("reports.submitFinalReport")}
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
