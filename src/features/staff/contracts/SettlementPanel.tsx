import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Boxes, CircleCheck, Landmark, Loader2, Pencil, PenLine, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { MoneyInput } from "@/components/shared/MoneyInput";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { useDisbursementsQuery } from "@/hooks/useDisbursements";
import { useDeliverablesQuery } from "@/hooks/useDeliverables";
import {
  useCreateSettlementMutation,
  useDeleteSettlementMutation,
  useMarkAccountingClearedMutation,
  useMarkAssetsClearedMutation,
  useSettlementQuery,
  useSignSettlementMutation,
  useUnsignSettlementMutation,
  useUpdateSettlementMutation,
} from "@/hooks/useSettlements";
import { useAuthStore } from "@/store/auth.store";
import { DISBURSEMENT_STATUS } from "@/types/disbursement";
import { ACCEPTANCE_STATUS } from "@/types/deliverable";
import type { CreateSettlementPayload, Settlement } from "@/types/settlement";
import { formatCurrency, formatDate } from "@/utils/format";

/**
 * Quyết toán & thanh lý hợp đồng (QĐ543 Điều 13, 17; Biểu mẫu 13).
 *
 * "Quyết toán" = chủ nhiệm đối chiếu toàn bộ hoá đơn, chứng từ đã chi với Ban Kế toán (làm NGOÀI hệ
 * thống — rule #15: hệ thống không quản tiền). Hệ thống ghi lại kết quả: tổng giá trị, đã nhận bao
 * nhiêu, hoàn trả bao nhiêu, kế toán đã xác nhận chưa, rồi Phòng QLKH ký Biên bản thanh lý BM13 để
 * đóng hợp đồng.
 *
 * 03/10: số liệu TỰ ĐIỀN từ hợp đồng và lịch giải ngân (trước đây "Đã giải ngân" ra 0 vì chỉ cộng số
 * thực chi mà Staff thường bỏ trống), ô tiền có dấu chấm ngăn hàng nghìn, sửa/xoá được khi chưa ký,
 * huỷ ký được khi ký nhầm — hai thao tác sau bắt ghi lý do vào sổ quyết định.
 */
export function SettlementPanel({
  contractId,
  canManage,
  totalAmount,
}: {
  contractId: string;
  canManage: boolean;
  /** Giá trị hợp đồng — nguồn đúng cho "Giá trị hợp đồng" (tổng kế hoạch các đợt có thể lệch nếu lịch sinh sai). */
  totalAmount?: number | null;
}) {
  const { t } = useTranslation();
  const { data: settlement, isLoading } = useSettlementQuery(contractId);
  const { data: disbursements } = useDisbursementsQuery(contractId);
  const { data: deliverables } = useDeliverablesQuery(contractId);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const signMutation = useSignSettlementMutation(contractId);
  const accountingMutation = useMarkAccountingClearedMutation(contractId);
  const assetsMutation = useMarkAssetsClearedMutation(contractId);
  const deleteMutation = useDeleteSettlementMutation(contractId);
  const unsignMutation = useUnsignSettlementMutation(contractId);

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unsigning, setUnsigning] = useState(false);

  // Số gợi ý: giá trị hợp đồng; đã giải ngân = cộng các đợt ĐÃ CHI (số thực chi nếu có, không thì số
  // kế hoạch của đợt đó); sản phẩm = các sản phẩm đã nghiệm thu Đạt.
  const paid = (disbursements ?? [])
    .filter((d) => d.status === DISBURSEMENT_STATUS.DISBURSED)
    .reduce((sum, d) => sum + (d.actualAmount ?? d.plannedAmount ?? 0), 0);
  const planned = (disbursements ?? []).reduce((sum, d) => sum + (d.plannedAmount ?? 0), 0);
  const suggested: CreateSettlementPayload = {
    totalContractedAmount: totalAmount ?? planned,
    totalDisbursedAmount: paid,
    totalReturnedAmount: 0,
    productsSubmittedSummary:
      (deliverables ?? [])
        .filter((d) => d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED)
        .map((d) => d.productName)
        .join("; ") || undefined,
  };

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (!settlement) {
    if (!canManage) {
      return (
        <EmptyState
          icon={Landmark}
          title={t("contract.settlement.noneStaff")}
          description={t("contract.settlement.noneStaffDesc")}
          className="min-h-32 border-none p-4"
        />
      );
    }
    // Chờ dữ liệu giải ngân/sản phẩm về rồi mới dựng form để số gợi ý có mặt ngay từ đầu.
    if (!disbursements || !deliverables) return <Skeleton className="h-40 w-full rounded-xl" />;
    return <SettlementForm contractId={contractId} initial={suggested} />;
  }

  const signed = Boolean(settlement.settlementSignedAt);
  const steps = [
    {
      key: "accounting",
      label: t("contract.settlement.accountingCleared"),
      at: settlement.accountingClearedAt,
      icon: Landmark,
      action: () => accountingMutation.mutate({ id: settlement.id }),
      pending: accountingMutation.isPending,
      cta: t("contract.settlement.markCleared"),
      blocked: false,
    },
    {
      key: "assets",
      label: t("contract.settlement.assetsCleared"),
      at: settlement.assetsClearedAt,
      icon: Boxes,
      action: () => assetsMutation.mutate({ id: settlement.id }),
      pending: assetsMutation.isPending,
      cta: t("contract.settlement.markCleared"),
      blocked: false,
    },
    {
      key: "sign",
      label: t("contract.settlement.signed"),
      at: settlement.settlementSignedAt,
      by: settlement.sideASigneeName,
      icon: PenLine,
      action: () => currentUserId && signMutation.mutate({ id: settlement.id, sideASigneeId: currentUserId }),
      pending: signMutation.isPending,
      cta: t("contract.settlement.signAsSideA"),
      blocked: !settlement.accountingClearedAt || !settlement.assetsClearedAt,
    },
  ];

  return (
    <div className="space-y-3">
      {editing ? (
        <SettlementForm contractId={contractId} existing={settlement} onDone={() => setEditing(false)} />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{t("contract.settlement.figures")}</p>
              <div className="flex items-center gap-1">
                {/* Hạn hoàn tất = 60 ngày làm việc kể từ nghiệm thu (QĐ543 Điều 13.3) — chỉ còn ý
                    nghĩa khi chưa ký thanh lý. */}
                {settlement.settlementDeadline && !signed && (
                  <DeadlineBadge
                    deadline={settlement.settlementDeadline}
                    daysLeft={settlement.daysLeft}
                    basis={t("contract.settlement.deadlineBasis")}
                  />
                )}
                {canManage && !signed && (
                  <>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setEditing(true)}>
                      <Pencil className="size-3.5" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("common.delete")}
                      title={t("common.delete")}
                      onClick={() => setDeleting(true)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: t("contract.settlement.contracted"), value: settlement.totalContractedAmount },
                { label: t("contract.settlement.disbursed"), value: settlement.totalDisbursedAmount },
                { label: t("contract.settlement.returned"), value: settlement.totalReturnedAmount },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border p-2">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(item.value ?? 0)}
                  </dd>
                </div>
              ))}
            </dl>
            {settlement.productsSubmittedSummary && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t("contract.settlement.products")}: </span>
                {settlement.productsSubmittedSummary}
              </p>
            )}
            {settlement.notes && <p className="mt-1 text-xs text-muted-foreground">{settlement.notes}</p>}
          </CardContent>
        </Card>
      )}

      {steps.map(({ key, label, at, by, icon: Icon, action, pending, cta, blocked }) => (
        <div
          key={key}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-2">
            {at ? <CircleCheck className="size-4 text-success" /> : <Icon className="size-4 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">
                {at ? `${formatDate(at)}${by ? ` · ${by}` : ""}` : t("contract.settlement.notDone")}
              </p>
            </div>
          </div>
          {canManage && !at && (
            <Button type="button" size="sm" variant="outline" disabled={pending || blocked} onClick={action}>
              {pending && <Loader2 className="animate-spin" />}
              {cta}
            </Button>
          )}
          {/* Ký nhầm / biên bản phải sửa sau khi ký — huỷ chữ ký, lý do vào sổ quyết định. */}
          {canManage && key === "sign" && at && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setUnsigning(true)}>
              <RotateCcw />
              {t("contract.settlement.unsign")}
            </Button>
          )}
          {/* Điều 13.2: hồ sơ sau nghiệm thu phải được lưu trữ trước — BE chặn, nhắc trước để khỏi bấm rồi mới biết. */}
          {key === "sign" && !at && !blocked && (
            <p className="w-full text-xs text-muted-foreground">{t("contract.settlement.signNeedsArchive")}</p>
          )}
          {key === "sign" && blocked && (
            <p className="w-full text-xs text-warning">{t("contract.settlement.signBlocked")}</p>
          )}
        </div>
      ))}

      <ReasonDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("contract.settlement.deleteTitle")}
        description={t("contract.settlement.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={(reason) =>
          deleteMutation.mutate({ id: settlement.id, reason }, { onSuccess: () => setDeleting(false) })
        }
      />
      <ReasonDialog
        open={unsigning}
        onOpenChange={setUnsigning}
        title={t("contract.settlement.unsignTitle")}
        description={t("contract.settlement.unsignDescription")}
        confirmLabel={t("contract.settlement.unsign")}
        isLoading={unsignMutation.isPending}
        onConfirm={(reason) =>
          unsignMutation.mutate({ id: settlement.id, reason }, { onSuccess: () => setUnsigning(false) })
        }
      />
    </div>
  );
}

/** Form lập (chưa có hồ sơ) hoặc sửa (hồ sơ chưa ký) — cùng một bộ ô. */
function SettlementForm({
  contractId,
  initial,
  existing,
  onDone,
}: {
  contractId: string;
  initial?: CreateSettlementPayload;
  existing?: Settlement;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateSettlementMutation(contractId);
  const updateMutation = useUpdateSettlementMutation(contractId);
  const source = existing ?? initial;

  const [contracted, setContracted] = useState(String(source?.totalContractedAmount ?? ""));
  const [disbursed, setDisbursed] = useState(String(source?.totalDisbursedAmount ?? ""));
  const [returned, setReturned] = useState(String(source?.totalReturnedAmount ?? ""));
  const [productsSummary, setProductsSummary] = useState(source?.productsSubmittedSummary ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const pending = createMutation.isPending || updateMutation.isPending;

  const submit = () => {
    const payload: CreateSettlementPayload = {
      totalContractedAmount: Number(contracted || 0),
      totalDisbursedAmount: Number(disbursed || 0),
      totalReturnedAmount: Number(returned || 0),
      productsSubmittedSummary: productsSummary.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (existing) updateMutation.mutate({ id: existing.id, payload }, { onSuccess: () => onDone?.() });
    else createMutation.mutate(payload);
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {existing ? t("contract.settlement.editTitle") : t("contract.settlement.prepare")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("contract.settlement.prepareHint")}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: "s-contracted", label: t("contract.settlement.contracted"), value: contracted, set: setContracted },
            { id: "s-disbursed", label: t("contract.settlement.disbursed"), value: disbursed, set: setDisbursed },
            { id: "s-returned", label: t("contract.settlement.returned"), value: returned, set: setReturned },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {f.label}
              </label>
              <div className="relative">
                <MoneyInput id={f.id} className="pr-7" placeholder="0" value={f.value} onValueChange={f.set} />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  đ
                </span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="s-products" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("contract.settlement.products")}
          </label>
          <Textarea
            id="s-products"
            rows={2}
            placeholder={t("contract.settlement.productsPlaceholder")}
            value={productsSummary}
            onChange={(e) => setProductsSummary(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="s-notes" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("contract.settlement.notes")}
          </label>
          <Textarea id="s-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          {existing && (
            <Button type="button" variant="ghost" onClick={onDone}>
              {t("common.cancel")}
            </Button>
          )}
          {/* Rule #15 (thầy tuần 10): "Tài chính = minh chứng, hệ thống KHÔNG quản tiền" — số tiền là
              tuỳ chọn (bỏ trống = 0); hệ thống chỉ ghi lại con số Ban Kế toán xác nhận. */}
          <Button type="button" disabled={pending} onClick={submit}>
            {pending ? <Loader2 className="animate-spin" /> : <Landmark />}
            {existing ? t("common.save") : t("contract.settlement.create")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
