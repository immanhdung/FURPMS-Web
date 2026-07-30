import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock, ExternalLink, Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { useDeliverablesQuery } from "@/hooks/useDeliverables";
import { SubmitDeliverableDialog } from "@/features/staff/contracts/SubmitDeliverableDialog";
import { ACCEPTANCE_STATUS, type Deliverable } from "@/types/deliverable";
import { formatDate, formatDateTime } from "@/utils/format";

/** Trang PI nộp SẢN PHẨM của hợp đồng (Staff định nghĩa sản phẩm trước; PI nộp file, Staff nghiệm thu). */
export function DeliverablesPage() {
  const { t } = useTranslation();
  const { data: contracts, proposalTitleById, isLoading: isContractsLoading } = useMyContractsQuery();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<Deliverable | null>(null);

  const contractId = selectedContractId ?? contracts?.[0]?.id ?? null;
  const { data: deliverables, isLoading: isLoadingList } = useDeliverablesQuery(contractId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
          <Package className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("deliverablesPage.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("deliverablesPage.subtitle")}</p>
        </div>
      </motion.div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState icon={Package} title={t("reports.noContracts")} description={t("reports.progressNoContractsDesc")} />
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

          {isLoadingList ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !deliverables || deliverables.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("deliverablesPage.empty")}
              description={t("deliverablesPage.emptyDesc")}
              className="min-h-40"
            />
          ) : (
            <ul className="space-y-2">
              {deliverables.map((d) => {
                const isSubmitted = Boolean(d.submittedAt);
                const isPassed = d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED;
                return (
                  <li key={d.id} className="space-y-2 rounded-lg border border-border bg-card/95 p-4 shadow-soft-xs transition-shadow hover:shadow-soft-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{d.productName}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          {d.dueDate ? t("contract.deliverable.due", { date: formatDate(d.dueDate) }) : t("contract.deliverable.noDueDate")}
                        </p>
                      </div>
                      {d.acceptanceStatus && <StatusBadge status={d.acceptanceStatus} />}
                    </div>

                    {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}

                    {isSubmitted && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{t("contract.deliverable.submitted", { date: formatDateTime(d.submittedAt) })}</span>
                        {d.fileUrl && (
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="size-3" />
                            {t("contract.deliverable.openFile")}
                          </a>
                        )}
                      </div>
                    )}

                    {d.qualityAssessment && (
                      <p className="text-xs text-muted-foreground">
                        {t("reports.evaluation")}: {d.qualityAssessment}
                      </p>
                    )}

                    {!isPassed && (
                      <Button size="sm" onClick={() => setSubmitting(d)}>
                        <Upload />
                        {isSubmitted ? t("contract.deliverable.resubmit") : t("contract.deliverable.submit")}
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
        <SubmitDeliverableDialog
          open={Boolean(submitting)}
          onOpenChange={(open) => !open && setSubmitting(null)}
          contractId={contractId}
          deliverable={submitting}
        />
      )}
    </div>
  );
}
