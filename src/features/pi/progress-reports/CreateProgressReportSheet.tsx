import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProgressReportMutation, useSubmitProgressReportMutation } from "@/hooks/useProgressReports";

interface CreateProgressReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
}

/**
 * The backend has no endpoint to edit a progress report's content after creation (only create,
 * schedule, evaluate, submit) — so this form does create + submit as one action instead of
 * leaving an uneditable "draft" sitting around. All editing happens here, client-side, before
 * anything is sent; once submitted there's no way to fix a typo without asking staff to help
 * (a real backend gap — flagged for a PATCH content endpoint).
 */
export function CreateProgressReportSheet({ open, onOpenChange, contractId }: CreateProgressReportSheetProps) {
  const { t } = useTranslation();
  const createMutation = useCreateProgressReportMutation(contractId);
  const submitMutation = useSubmitProgressReportMutation(contractId);
  const isSubmitting = createMutation.isPending || submitMutation.isPending;

  const [reportingPeriodStart, setReportingPeriodStart] = useState("");
  const [reportingPeriodEnd, setReportingPeriodEnd] = useState("");
  const [completedContent, setCompletedContent] = useState("");
  const [pendingContent, setPendingContent] = useState("");
  const [overallCompletionPct, setOverallCompletionPct] = useState("");
  const [expenditureToDate, setExpenditureToDate] = useState("");
  const [nextPeriodPlan, setNextPeriodPlan] = useState("");
  const [piRecommendations, setPiRecommendations] = useState("");

  const reset = () => {
    setReportingPeriodStart("");
    setReportingPeriodEnd("");
    setCompletedContent("");
    setPendingContent("");
    setOverallCompletionPct("");
    setExpenditureToDate("");
    setNextPeriodPlan("");
    setPiRecommendations("");
  };

  const onSubmit = () => {
    createMutation.mutate(
      {
        reportingPeriodStart: reportingPeriodStart || undefined,
        reportingPeriodEnd: reportingPeriodEnd || undefined,
        completedContent: completedContent || undefined,
        pendingContent: pendingContent || undefined,
        overallCompletionPct: overallCompletionPct ? Number(overallCompletionPct) : undefined,
        expenditureToDate: expenditureToDate ? Number(expenditureToDate) : undefined,
        nextPeriodPlan: nextPeriodPlan || undefined,
        piRecommendations: piRecommendations || undefined,
      },
      {
        onSuccess: (report) => {
          submitMutation.mutate(report.id, {
            onSuccess: () => {
              reset();
              onOpenChange(false);
            },
          });
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reports.newProgress")}
      description={t("reports.newProgressHint")}
      formId="progress-report-form"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={t("reports.submitReport")}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.periodStart")}</label>
          <Input type="date" value={reportingPeriodStart} onChange={(e) => setReportingPeriodStart(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.periodEnd")}</label>
          <Input type="date" value={reportingPeriodEnd} onChange={(e) => setReportingPeriodEnd(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.completedWork")}</label>
        <Textarea rows={3} value={completedContent} onChange={(e) => setCompletedContent(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.pendingWork")}</label>
        <Textarea rows={3} value={pendingContent} onChange={(e) => setPendingContent(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.overallCompletion")}</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={overallCompletionPct}
            onChange={(e) => setOverallCompletionPct(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.expenditure")}</label>
          <Input type="number" min={0} value={expenditureToDate} onChange={(e) => setExpenditureToDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.nextPeriodPlan")}</label>
        <Textarea rows={3} value={nextPeriodPlan} onChange={(e) => setNextPeriodPlan(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.recommendations")}</label>
        <Textarea rows={2} value={piRecommendations} onChange={(e) => setPiRecommendations(e.target.value)} />
      </div>
    </FormSheet>
  );
}
