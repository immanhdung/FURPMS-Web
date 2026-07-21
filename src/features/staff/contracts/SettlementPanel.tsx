import { useState } from "react";
import { CheckCircle2, FileSignature, Landmark, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useCreateSettlementMutation,
  useMarkAccountingClearedMutation,
  useMarkAssetsClearedMutation,
  useSettlementQuery,
  useSignSettlementMutation,
} from "@/hooks/useSettlement";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate } from "@/utils/format";

export function SettlementPanel({ contractId }: { contractId: string }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: settlement, isLoading } = useSettlementQuery(contractId);
  const createMutation = useCreateSettlementMutation(contractId);
  const signMutation = useSignSettlementMutation(contractId);
  const accountingMutation = useMarkAccountingClearedMutation(contractId);
  const assetsMutation = useMarkAssetsClearedMutation(contractId);

  const [totalContractedAmount, setTotalContractedAmount] = useState("");
  const [totalDisbursedAmount, setTotalDisbursedAmount] = useState("");
  const [totalReturnedAmount, setTotalReturnedAmount] = useState("0");
  const [productsSubmittedSummary, setProductsSubmittedSummary] = useState("");
  const [settlementDeadline, setSettlementDeadline] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading) return <Skeleton className="h-40 w-full rounded-lg" />;

  if (!settlement) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
        <p className="text-sm font-medium text-foreground">Create settlement</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Total contracted</label>
            <Input type="number" min={0} value={totalContractedAmount} onChange={(e) => setTotalContractedAmount(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Total disbursed</label>
            <Input type="number" min={0} value={totalDisbursedAmount} onChange={(e) => setTotalDisbursedAmount(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Total returned</label>
            <Input type="number" min={0} value={totalReturnedAmount} onChange={(e) => setTotalReturnedAmount(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Products submitted summary</label>
          <Textarea rows={2} value={productsSubmittedSummary} onChange={(e) => setProductsSubmittedSummary(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Settlement deadline</label>
            <Input type="date" value={settlementDeadline} onChange={(e) => setSettlementDeadline(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <Button
          size="sm"
          disabled={!totalContractedAmount || !totalDisbursedAmount || createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              totalContractedAmount: Number(totalContractedAmount),
              totalDisbursedAmount: Number(totalDisbursedAmount),
              totalReturnedAmount: Number(totalReturnedAmount || 0),
              productsSubmittedSummary: productsSubmittedSummary || undefined,
              settlementDeadline: settlementDeadline || undefined,
              notes: notes || undefined,
            })
          }
        >
          <Landmark />
          Create settlement
        </Button>
      </div>
    );
  }

  const isSigned = Boolean(settlement.signedAt);
  const isAccountingCleared = Boolean(settlement.accountingClearedAt);
  const isAssetsCleared = Boolean(settlement.assetsClearedAt);

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Settlement</p>
        {settlement.status && <StatusBadge status={settlement.status} />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Contracted</p>
          <p className="mt-0.5 text-sm text-foreground">
            {settlement.totalContractedAmount != null ? formatCurrency(settlement.totalContractedAmount) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Disbursed</p>
          <p className="mt-0.5 text-sm text-foreground">
            {settlement.totalDisbursedAmount != null ? formatCurrency(settlement.totalDisbursedAmount) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Returned</p>
          <p className="mt-0.5 text-sm text-foreground">
            {settlement.totalReturnedAmount != null ? formatCurrency(settlement.totalReturnedAmount) : "-"}
          </p>
        </div>
      </div>

      {settlement.settlementDeadline && (
        <p className="text-xs text-muted-foreground">Deadline: {formatDate(settlement.settlementDeadline)}</p>
      )}
      {settlement.productsSubmittedSummary && (
        <p className="text-xs text-muted-foreground">{settlement.productsSubmittedSummary}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant={isSigned ? "outline" : "default"}
          disabled={isSigned || signMutation.isPending || !currentUserId}
          onClick={() => currentUserId && signMutation.mutate({ id: settlement.id, payload: { sideASigneeId: currentUserId } })}
        >
          <FileSignature />
          {isSigned ? "Signed" : "Sign"}
        </Button>
        <Button
          size="sm"
          variant={isAccountingCleared ? "outline" : "default"}
          disabled={isAccountingCleared || accountingMutation.isPending}
          onClick={() => accountingMutation.mutate(settlement.id)}
        >
          <CheckCircle2 />
          {isAccountingCleared ? "Accounting cleared" : "Mark accounting cleared"}
        </Button>
        <Button
          size="sm"
          variant={isAssetsCleared ? "outline" : "default"}
          disabled={isAssetsCleared || assetsMutation.isPending}
          onClick={() => assetsMutation.mutate(settlement.id)}
        >
          <PackageCheck />
          {isAssetsCleared ? "Assets cleared" : "Mark assets cleared"}
        </Button>
      </div>
    </div>
  );
}
