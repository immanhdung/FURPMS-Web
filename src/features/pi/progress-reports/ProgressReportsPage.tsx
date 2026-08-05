import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock, Eye, ExternalLink, FileBarChart, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { useProgressReportsQuery } from "@/hooks/useProgressReports";
import { CreateProgressReportSheet } from "@/features/pi/progress-reports/CreateProgressReportSheet";
import { ProgressReportDetailView } from "@/components/shared/ProgressReportDetailView";
import { formatDate, formatDateTime } from "@/utils/format";
import type { ProgressReport } from "@/types/progress-report";

export function ProgressReportsPage() {
  const { t } = useTranslation();
  const { data: contracts, proposalTitleById, isLoading: isContractsLoading } = useMyContractsQuery();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [fillingReport, setFillingReport] = useState<ProgressReport | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const contractId = selectedContractId ?? contracts?.[0]?.id ?? null;
  const { data: reports, isLoading: isReportsLoading } = useProgressReportsQuery(contractId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
          <FileBarChart className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reports.progressTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("reports.progressSubtitle")}</p>
        </div>
      </motion.div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title={t("reports.noContracts")}
          description={t("reports.progressNoContractsDesc")}
        />
      ) : (
        <>
          {/* Trước đây ô này chỉ hiện trơ số hợp đồng ("04") — không ai đoán được đó là gì.
              Nay có nhãn rõ + kèm TÊN ĐỀ TÀI để phân biệt khi PI có nhiều hợp đồng. */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("reports.contractLabel")}
            </label>
            <Select value={contractId ?? undefined} onValueChange={setSelectedContractId}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue placeholder={t("reports.selectContract")} />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((contract) => {
                  const title = proposalTitleById.get(contract.proposalId);
                  return (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.contractNumber
                        ? `${t("reports.contractNo", { no: contract.contractNumber })}${title ? ` — ${title}` : ""}`
                        : title || contract.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {isReportsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            // Kỳ báo cáo do phòng QLKH (Staff) mở sẵn (QĐ543 Điều 10) — PI không tự tạo kỳ.
            <EmptyState
              icon={FileBarChart}
              title={t("reports.noProgressYet")}
              description={t("reports.piWaitSchedule")}
              className="min-h-40"
            />
          ) : (
            <ul className="space-y-2">
              {reports.map((report) => {
                const isSubmitted = Boolean(report.submittedAt);
                return (
                  <li key={report.id} className="space-y-2 rounded-lg border border-border bg-card/95 p-4 shadow-soft-xs transition-shadow hover:shadow-soft-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {/* Tên đợt Staff đặt; chưa đặt → "Kỳ {số}". */}
                        {report.roundName || t("reports.roundN", { n: report.reportRound ?? "" })} ·{" "}
                        {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
                      </p>
                      {report.status ? (
                        <StatusBadge status={report.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{isSubmitted ? "Submitted" : "Draft"}</span>
                      )}
                    </div>

                    {report.overallCompletionPct != null && (
                      <p className="text-xs text-muted-foreground">
                        {t("reports.overallCompletion")}: {report.overallCompletionPct}%
                      </p>
                    )}

                    {report.dueDate && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        {t("reports.due")} {formatDate(report.dueDate)}
                        {report.scheduledMeetingAt && ` · ${formatDateTime(report.scheduledMeetingAt)}`}
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
                        {t("reports.joinLink")}
                      </a>
                    )}

                    {report.evaluationResult && (
                      <p className="text-xs text-muted-foreground">
                        {t("reports.evaluation")}: <StatusBadge status={report.evaluationResult} />
                        {report.evaluationComments && ` — ${report.evaluationComments}`}
                      </p>
                    )}

                    {/* Sửa được cho tới khi Staff ĐÃ đánh giá — nhất quán với sản phẩm và
                        báo cáo tổng kết. Đánh giá xong thì chỉ còn xem lại. */}
                    <div className="flex flex-wrap gap-2">
                      {!report.evaluationResult && (
                        <Button size="sm" onClick={() => setFillingReport(report)}>
                          <PencilLine />
                          {isSubmitted ? t("reports.editSubmitted") : t("reports.fillAndSubmit")}
                        </Button>
                      )}
                      {isSubmitted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingId(viewingId === report.id ? null : report.id)}
                        >
                          <Eye />
                          {viewingId === report.id ? t("common.close") : t("reports.viewSubmitted")}
                        </Button>
                      )}
                    </div>

                    {viewingId === report.id && <ProgressReportDetailView reportId={report.id} />}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {contractId && (
        <CreateProgressReportSheet
          open={Boolean(fillingReport)}
          onOpenChange={(open) => !open && setFillingReport(null)}
          contractId={contractId}
          proposalId={contracts?.find((c) => c.id === contractId)?.proposalId ?? null}
          report={fillingReport}
        />
      )}
    </div>
  );
}
