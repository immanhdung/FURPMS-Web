import { useState } from "react";
import { CheckCircle2, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDisbursementsQuery, useGenerateDisbursementsMutation } from "@/hooks/useDisbursements";
import { ConfirmDisbursementDialog } from "@/features/staff/contracts/ConfirmDisbursementDialog";
import { DISBURSEMENT_STATUS } from "@/constants/statuses";
import { formatCurrency, formatDate } from "@/utils/format";

export function DisbursementsPanel({ contractId }: { contractId: string }) {
  const { data: disbursements, isLoading } = useDisbursementsQuery(contractId);
  const generateMutation = useGenerateDisbursementsMutation(contractId);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const confirmingDisbursement = disbursements?.find((d) => d.id === confirmingId);

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !disbursements || disbursements.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No disbursement installments yet"
          description="Generate the installment plan once the contract is signed."
          className="min-h-32 border-none p-4"
          action={
            <Button size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              <Sparkles />
              Generate installments
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {disbursements.map((disbursement, index) => {
            const isConfirmed = disbursement.status?.toUpperCase() === DISBURSEMENT_STATUS.CONFIRMED;
            return (
              <li key={disbursement.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Installment {disbursement.installmentNumber ?? index + 1}
                    {disbursement.dueDate && (
                      <span className="ml-1.5 font-normal text-muted-foreground">· due {formatDate(disbursement.dueDate)}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {disbursement.actualAmount != null
                      ? formatCurrency(disbursement.actualAmount)
                      : disbursement.plannedAmount != null
                        ? `Planned ${formatCurrency(disbursement.plannedAmount)}`
                        : "-"}
                    {disbursement.bankReference && ` · Ref ${disbursement.bankReference}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {disbursement.status && <StatusBadge status={disbursement.status} />}
                  {!isConfirmed && (
                    <Button variant="outline" size="sm" onClick={() => setConfirmingId(disbursement.id)}>
                      <CheckCircle2 />
                      Confirm
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDisbursementDialog
        open={Boolean(confirmingId)}
        onOpenChange={(open) => !open && setConfirmingId(null)}
        contractId={contractId}
        disbursementId={confirmingId}
        plannedAmount={confirmingDisbursement?.plannedAmount}
      />
    </div>
  );
}
