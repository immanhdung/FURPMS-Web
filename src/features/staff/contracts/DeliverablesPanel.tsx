import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleX, ClipboardCheck, ExternalLink, Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeliverablesQuery } from "@/hooks/useDeliverables";
import { SubmitDeliverableDialog } from "@/features/staff/contracts/SubmitDeliverableDialog";
import { EvaluateDeliverableDialog } from "@/features/staff/contracts/EvaluateDeliverableDialog";
import { ACCEPTANCE_STATUS, type Deliverable } from "@/types/deliverable";
import { formatDate, formatDateTime } from "@/utils/format";

/**
 * Sản phẩm phải nộp của hợp đồng.
 * PI nộp file → Staff nghiệm thu. Nghiệm thu ĐẠT sẽ mở điều kiện chi tiền cho đợt giải ngân tương ứng.
 */
export function DeliverablesPanel({ contractId, canManage }: { contractId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const { data: deliverables, isLoading } = useDeliverablesQuery(contractId);
  const [submitting, setSubmitting] = useState<Deliverable | null>(null);
  const [evaluating, setEvaluating] = useState<Deliverable | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!deliverables || deliverables.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t("contract.deliverable.none")}
        description={t("contract.deliverable.noneDesc")}
        className="min-h-32 border-none p-4"
      />
    );
  }

  const passedCount = deliverables.filter((d) => d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED).length;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{passedCount}</span> {t("contract.disbursement.of")}{" "}
        <span className="font-medium text-foreground">{deliverables.length}</span> {t("contract.deliverable.accepted")}
      </div>

      {deliverables.map((d) => {
        const isSubmitted = Boolean(d.submittedAt);
        const isPassed = d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED;
        const isFailed = d.acceptanceStatus === ACCEPTANCE_STATUS.FAILED;

        return (
          <div key={d.id} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{d.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {d.categoryName && <span>{d.categoryName} · </span>}
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
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    {t("contract.deliverable.openFile")}
                  </a>
                )}
              </div>
            )}

            {d.qualityAssessment && (
              <p
                className={`text-xs ${isPassed ? "text-success" : isFailed ? "text-destructive" : "text-muted-foreground"}`}
              >
                {isPassed && <CircleCheck className="mr-1 inline size-3" />}
                {isFailed && <CircleX className="mr-1 inline size-3" />}
                {d.qualityAssessment}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {/* PI nộp/nộp lại — BE cho phép nộp lại khi bị đánh trượt. */}
              {!isPassed && (
                <Button size="sm" variant="outline" onClick={() => setSubmitting(d)}>
                  <Upload />
                  {isSubmitted ? t("contract.deliverable.resubmit") : t("contract.deliverable.submit")}
                </Button>
              )}
              {canManage && isSubmitted && !isPassed && (
                <Button size="sm" onClick={() => setEvaluating(d)}>
                  <ClipboardCheck />
                  {t("contract.deliverable.evaluate")}
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <SubmitDeliverableDialog
        open={Boolean(submitting)}
        onOpenChange={(open) => !open && setSubmitting(null)}
        contractId={contractId}
        deliverable={submitting}
      />
      <EvaluateDeliverableDialog
        open={Boolean(evaluating)}
        onOpenChange={(open) => !open && setEvaluating(null)}
        contractId={contractId}
        deliverable={evaluating}
      />
    </div>
  );
}
