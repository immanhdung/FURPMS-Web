import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ExternalLink, FileCheck2, Loader2, Pencil, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { useFinalReportQuery, useSubmitFinalReportMutation } from "@/hooks/useFinalReports";
import { finalReportDocumentService } from "@/services/api/final-report-document.service";
import { openDocumentLocation } from "@/services/api/fileDownload";
import type { ApiError } from "@/types/common";
import { FINAL_REPORT_STATUS } from "@/types/final-report";
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
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState<"report" | "summary" | null>(null);

  const uploadDocument = async (kind: "report" | "summary", file?: File) => {
    if (!file || !contractId) return;
    setUploading(kind);
    try {
      const document = await finalReportDocumentService.upload(contractId, file);
      if (!document.downloadUrl) throw new Error(t("reports.uploadMissingUrl"));
      if (kind === "report") setReportFileUrl(document.downloadUrl);
      else setSummaryFileUrl(document.downloadUrl);
      toast.success(t("reports.finalFileUploaded"));
    } catch (error) {
      toast.error((error as ApiError).message || t("toast.uploadFailed"));
    } finally {
      setUploading(null);
    }
  };

  const openDocument = async (location: string) => {
    try {
      await openDocumentLocation(location);
    } catch (error) {
      toast.error((error as ApiError).message || t("reports.openFileFailed"));
    }
  };

  const canEdit = !finalReport
    || finalReport.status === FINAL_REPORT_STATUS.SUBMITTED
    || finalReport.status === FINAL_REPORT_STATUS.REVISION_REQUIRED;
  const showForm = !finalReport || (canEdit && (isEditing || finalReport.status === FINAL_REPORT_STATUS.REVISION_REQUIRED));

  useEffect(() => {
    setReportFileUrl(finalReport?.reportFileUrl ?? "");
    setSummaryFileUrl(finalReport?.summaryFileUrl ?? "");
    setLanguage(finalReport?.language ?? "VI");
    setIsEditing(finalReport?.status === FINAL_REPORT_STATUS.REVISION_REQUIRED);
  }, [contractId, finalReport]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
          <FileCheck2 className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reports.finalTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("reports.finalSubtitle")}</p>
        </div>
      </motion.div>

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
            <div className="space-y-4 rounded-xl border border-border bg-card/95 p-4 shadow-soft-xs">
              {finalReport && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{t("reports.currentSubmission")}</p>
                    <div className="flex items-center gap-2">
                      {canEdit && !isEditing && (
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Pencil />
                          {t("reports.editSubmitted")}
                        </Button>
                      )}
                      {finalReport.status && <StatusBadge status={finalReport.status} />}
                    </div>
                  </div>
                  {finalReport.submittedAt && (
                    <p className="text-xs text-muted-foreground">{t("reports.submittedAt", { at: formatDateTime(finalReport.submittedAt) })}</p>
                  )}
                  {finalReport.reportFileUrl && (
                    <button
                      type="button"
                      onClick={() => void openDocument(finalReport.reportFileUrl!)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      {t("reports.reportFile")}
                    </button>
                  )}
                  {finalReport.status === FINAL_REPORT_STATUS.REVISION_REQUIRED && finalReport.revisionNotes && (
                    <p className="text-xs text-warning">{t("reports.revisionRequested", { notes: finalReport.revisionNotes })}</p>
                  )}
                </div>
              )}

              {showForm && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {finalReport ? t("reports.resubmitReport") : t("reports.submitReport")}
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.reportFileUpload")}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        disabled={Boolean(uploading)}
                        onChange={(event) => void uploadDocument("report", event.target.files?.[0])}
                      />
                      {uploading === "report" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 text-muted-foreground" />}
                    </div>
                    {reportFileUrl && <p className="mt-1 text-xs text-success">{t("reports.fileReady")}</p>}
                    <p className="my-1 text-center text-xs text-muted-foreground">{t("reports.orPasteLink")}</p>
                    <Input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={reportFileUrl.startsWith("/api/") ? "" : reportFileUrl}
                      onChange={(event) => setReportFileUrl(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.summaryFileUpload")}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        disabled={Boolean(uploading)}
                        onChange={(event) => void uploadDocument("summary", event.target.files?.[0])}
                      />
                      {uploading === "summary" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 text-muted-foreground" />}
                    </div>
                    {summaryFileUrl && <p className="mt-1 text-xs text-success">{t("reports.fileReady")}</p>}
                    <p className="my-1 text-center text-xs text-muted-foreground">{t("reports.orPasteLink")}</p>
                    <Input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={summaryFileUrl.startsWith("/api/") ? "" : summaryFileUrl}
                      onChange={(event) => setSummaryFileUrl(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("reports.language")}</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reports.langPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VI">{t("contract.finalReport.langVI")}</SelectItem>
                        <SelectItem value="EN">{t("contract.finalReport.langEN")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    disabled={submitMutation.isPending || Boolean(uploading) || !reportFileUrl || !language}
                    onClick={() =>
                      submitMutation.mutate({
                        reportFileUrl,
                        summaryFileUrl: summaryFileUrl || undefined,
                        language,
                      }, { onSuccess: () => setIsEditing(false) })
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
