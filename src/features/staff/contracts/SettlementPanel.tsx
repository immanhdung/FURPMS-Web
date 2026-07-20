import { useEffect, useState } from "react";
import { CircleCheck, Landmark, Loader2, PenLine, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDisbursementsQuery } from "@/hooks/useDisbursements";
import {
  useCreateSettlementMutation,
  useMarkAccountingClearedMutation,
  useMarkAssetsClearedMutation,
  useSettlementQuery,
  useSignSettlementMutation,
} from "@/hooks/useSettlements";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate } from "@/utils/format";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Quyết toán hợp đồng: lập bảng số liệu → Chủ tài khoản ký → kế toán xác nhận → tài sản xác nhận.
 * Số liệu lấy sẵn từ lịch giải ngân để Staff khỏi cộng tay.
 */
export function SettlementPanel({ contractId, canManage }: { contractId: string; canManage: boolean }) {
  const { data: settlement, isLoading } = useSettlementQuery(contractId);
  const { data: disbursements } = useDisbursementsQuery(contractId);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const createMutation = useCreateSettlementMutation(contractId);
  const signMutation = useSignSettlementMutation(contractId);
  const accountingMutation = useMarkAccountingClearedMutation(contractId);
  const assetsMutation = useMarkAssetsClearedMutation(contractId);

  const [contracted, setContracted] = useState("");
  const [disbursed, setDisbursed] = useState("");
  const [returned, setReturned] = useState("0");
  const [productsSummary, setProductsSummary] = useState("");
  const [notes, setNotes] = useState("");

  // Cộng sẵn từ các đợt giải ngân: kế hoạch = giá trị hợp đồng, thực chi = tổng đã chi.
  useEffect(() => {
    if (!settlement && disbursements) {
      const planned = disbursements.reduce((sum, d) => sum + (d.plannedAmount ?? 0), 0);
      const paid = disbursements.reduce((sum, d) => sum + (d.actualAmount ?? 0), 0);
      setContracted(String(planned));
      setDisbursed(String(paid));
    }
  }, [settlement, disbursements]);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (!settlement) {
    if (!canManage) {
      return (
        <EmptyState
          icon={Landmark}
          title="No settlement yet"
          description="Staff will prepare the settlement once the project wraps up."
          className="min-h-32 border-none p-4"
        />
      );
    }

    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Prepare settlement</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Amounts are pre-filled from the disbursement schedule — adjust if the books say otherwise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="s-contracted" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Contracted
              </label>
              <Input id="s-contracted" type="number" value={contracted} onChange={(e) => setContracted(e.target.value)} />
            </div>
            <div>
              <label htmlFor="s-disbursed" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Disbursed
              </label>
              <Input id="s-disbursed" type="number" value={disbursed} onChange={(e) => setDisbursed(e.target.value)} />
            </div>
            <div>
              <label htmlFor="s-returned" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Returned
              </label>
              <Input id="s-returned" type="number" value={returned} onChange={(e) => setReturned(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="s-products" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Products submitted
            </label>
            <Textarea
              id="s-products"
              rows={2}
              placeholder="Summary of what was delivered and accepted"
              value={productsSummary}
              onChange={(e) => setProductsSummary(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="s-notes" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Notes
            </label>
            <Textarea id="s-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!contracted || !disbursed || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  totalContractedAmount: Number(contracted),
                  totalDisbursedAmount: Number(disbursed),
                  totalReturnedAmount: Number(returned || 0),
                  productsSubmittedSummary: productsSummary.trim() || undefined,
                  notes: notes.trim() || undefined,
                })
              }
            >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Landmark />}
              Create settlement
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    {
      key: "sign",
      label: "Signed",
      at: settlement.settlementSignedAt,
      by: settlement.sideASigneeName,
      icon: PenLine,
      action: () =>
        currentUserId && signMutation.mutate({ id: settlement.id, sideASigneeId: currentUserId }),
      pending: signMutation.isPending,
      cta: "Sign as side A",
    },
    {
      key: "accounting",
      label: "Accounting cleared",
      at: settlement.accountingClearedAt,
      icon: Landmark,
      action: () => accountingMutation.mutate({ id: settlement.id, clearedDate: today() }),
      pending: accountingMutation.isPending,
      cta: "Mark cleared",
    },
    {
      key: "assets",
      label: "Assets cleared",
      at: settlement.assetsClearedAt,
      icon: Boxes,
      action: () => assetsMutation.mutate({ id: settlement.id, clearedDate: today() }),
      pending: assetsMutation.isPending,
      cta: "Mark cleared",
    },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground">Settlement figures</p>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Contracted", value: settlement.totalContractedAmount },
              { label: "Disbursed", value: settlement.totalDisbursedAmount },
              { label: "Returned", value: settlement.totalReturnedAmount },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-2">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold text-foreground">{formatCurrency(item.value ?? 0)}</dd>
              </div>
            ))}
          </dl>
          {settlement.productsSubmittedSummary && (
            <p className="mt-3 text-xs text-muted-foreground">{settlement.productsSubmittedSummary}</p>
          )}
          {settlement.notes && <p className="mt-1 text-xs text-muted-foreground">{settlement.notes}</p>}
        </CardContent>
      </Card>

      {steps.map(({ key, label, at, by, icon: Icon, action, pending, cta }) => (
        <div key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            {at ? <CircleCheck className="size-4 text-success" /> : <Icon className="size-4 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">
                {at ? `${formatDate(at)}${by ? ` · ${by}` : ""}` : "Not done yet"}
              </p>
            </div>
          </div>
          {canManage && !at && (
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={action}>
              {pending && <Loader2 className="animate-spin" />}
              {cta}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
