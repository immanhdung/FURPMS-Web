import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BanknoteArrowUp, CircleCheck, Clock, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDisbursementsQuery, useGenerateDisbursementsMutation } from "@/hooks/useDisbursements";
import { ConfirmDisbursementDialog } from "@/features/staff/contracts/ConfirmDisbursementDialog";
import { DISBURSEMENT_STATUS, type Disbursement } from "@/types/disbursement";
import { formatCurrency, formatDate } from "@/utils/format";

/**
 * Lịch giải ngân của hợp đồng.
 * Rule #6: lịch do BE sinh theo phương thức cấp kinh phí (WHOLE ≥3 đợt / PARTIAL theo mốc sản phẩm).
 * Rule #3: điều kiện đạt chỉ bật cờ "sẵn sàng chi" — Staff vẫn phải xác nhận tay sau khi chi thật.
 */
export function DisbursementsPanel({ contractId, canManage }: { contractId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const { data: disbursements, isLoading } = useDisbursementsQuery(contractId);
  const generateMutation = useGenerateDisbursementsMutation(contractId);
  const [confirming, setConfirming] = useState<Disbursement | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!disbursements || disbursements.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title={t("contract.disbursement.noSchedule")}
        description={
          canManage
            ? t("contract.disbursement.generateHint")
            : t("contract.disbursement.staffNotGenerated")
        }
        className="min-h-32 border-none p-4"
        action={
          canManage ? (
            <Button size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? <Loader2 className="animate-spin" /> : <BanknoteArrowUp />}
              {t("contract.disbursement.generate")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  const totalPlanned = disbursements.reduce((sum, d) => sum + (d.plannedAmount ?? 0), 0);
  const totalPaid = disbursements.reduce((sum, d) => sum + (d.actualAmount ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
        <span className="text-muted-foreground">
          {t("contract.disbursement.paid")} <span className="font-medium text-foreground">{formatCurrency(totalPaid)}</span> {t("contract.disbursement.of")}{" "}
          <span className="font-medium text-foreground">{formatCurrency(totalPlanned)}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {disbursements.filter((d) => d.status === DISBURSEMENT_STATUS.DISBURSED).length}/{disbursements.length} {t("contract.disbursement.tranches")}
        </span>
      </div>

      {disbursements.map((d) => {
        const isDisbursed = d.status === DISBURSEMENT_STATUS.DISBURSED;
        const isReady = !isDisbursed && Boolean(d.conditionMetAt);

        return (
          <div key={d.id} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("contract.disbursement.tranche")} {d.roundNumber} · {formatCurrency(d.plannedAmount)}{" "}
                  <span className="text-muted-foreground">({d.percentage}%)</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.conditionDescription}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>

            {isDisbursed ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-success">
                  <CircleCheck className="size-3" />
                  {t("contract.disbursement.paidOn", { amount: formatCurrency(d.actualAmount ?? 0), date: formatDate(d.disbursedAt) })}
                </span>
                {d.bankReference && <span>{t("contract.disbursement.ref")} {d.bankReference}</span>}
                {d.notes && <span className="w-full">{d.notes}</span>}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {isReady
                    ? t("contract.disbursement.conditionMet", { date: formatDate(d.conditionMetAt) })
                    : t("contract.disbursement.waiting")}
                </span>
                {canManage && (
                  <Button size="sm" variant={isReady ? "default" : "outline"} onClick={() => setConfirming(d)}>
                    <BanknoteArrowUp />
                    {t("contract.disbursement.confirmPayment")}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <ConfirmDisbursementDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        contractId={contractId}
        disbursement={confirming}
      />
    </div>
  );
}
