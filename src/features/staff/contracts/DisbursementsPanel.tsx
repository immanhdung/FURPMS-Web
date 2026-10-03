import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BanknoteArrowUp, CircleCheck, Clock, Loader2, Lock, PencilLine, RefreshCw, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useDisbursementsQuery,
  useGenerateDisbursementsMutation,
  useRegenerateDisbursementsMutation,
  useUndoDisbursementMutation,
} from "@/hooks/useDisbursements";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { ConfirmDisbursementDialog } from "@/features/staff/contracts/ConfirmDisbursementDialog";
import { DisbursementScheduleEditor } from "@/features/staff/contracts/DisbursementScheduleEditor";
import { DisbursementEvidence } from "@/features/staff/contracts/DisbursementEvidence";
import { DisbursementDeliverableLink } from "@/features/staff/contracts/DisbursementDeliverableLink";
import { DISBURSEMENT_STATUS, type Disbursement } from "@/types/disbursement";
import { formatCurrency, formatDate } from "@/utils/format";

/**
 * Lịch giải ngân của hợp đồng — theo LOẠI ĐỀ TÀI (QĐ543 Điều 16): Ứng dụng 4 đợt 30–30–30–10 (đợt 1 sau
 * ký, đợt 2–3 sau tiến độ giai đoạn 1–2 Đạt, đợt 4 sau nghiệm thu Đạt); Cơ bản 1 lần 100% sau nghiệm thu.
 * Tiền chi NGOÀI hệ thống (rule #15) — Staff tải chứng từ rồi đánh dấu đã chi.
 *
 * 03/10: mỗi đợt nói rõ đang chờ gì (BE trả `lockReason`); "Sinh lại lịch" khi lịch sinh sai (loại đề
 * tài cấu hình sai ⇒ 1 đợt "cuối" chặn mọi thứ — lỗi deploy); "Huỷ xác nhận" khi bấm nhầm.
 */
export function DisbursementsPanel({
  contractId,
  canManage,
  researchTypeName,
  isApplied,
  expectedRounds,
}: {
  contractId: string;
  canManage: boolean;
  researchTypeName?: string | null;
  isApplied?: boolean;
  /** Số đợt đúng theo loại — lịch đã sinh có số đợt khác thì cảnh báo (03/10). */
  expectedRounds?: number;
}) {
  const { t } = useTranslation();
  const { data: disbursements, isLoading } = useDisbursementsQuery(contractId);
  const generateMutation = useGenerateDisbursementsMutation(contractId);
  const regenerateMutation = useRegenerateDisbursementsMutation(contractId);
  const undoMutation = useUndoDisbursementMutation(contractId);
  const [confirming, setConfirming] = useState<Disbursement | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [undoing, setUndoing] = useState<Disbursement | null>(null);

  // Quy định áp cho hợp đồng này — nói thẳng ra để thấy ngay khi loại đề tài bị cấu hình sai.
  const rule = (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {t("contract.disbursement.ruleTitle", { type: researchTypeName ?? "—" })}
      </span>{" "}
      {isApplied ? t("contract.disbursement.ruleApplied") : t("contract.disbursement.ruleBasic")}
    </div>
  );

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
      <div className="space-y-3">
        {rule}
        <EmptyState
          icon={Wallet}
          title={t("contract.disbursement.noSchedule")}
          description={
            canManage ? t("contract.disbursement.generateHint") : t("contract.disbursement.staffNotGenerated")
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
      </div>
    );
  }

  const anyPaid = disbursements.some((d) => d.status === DISBURSEMENT_STATUS.DISBURSED);
  // Lịch khác mẫu của loại: đã chỉnh tay (hợp lệ, có sổ quyết định) hoặc sinh theo loại cấu hình sai trước 03/10
  // — chỉ nhắc, không coi là lỗi.
  const mismatch = expectedRounds != null && disbursements.length !== expectedRounds;

  return (
    <div className="space-y-3">
      {rule}
      {mismatch && (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {t("contract.disbursement.kindMismatch", { actual: disbursements.length, expected: expectedRounds })}{" "}
          {canManage && t("contract.disbursement.kindMismatchFix")}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <span>{t("contract.disbursement.evidenceNote")}</span>
        <span className="flex items-center gap-2">
          {disbursements.filter((d) => d.status === DISBURSEMENT_STATUS.DISBURSED).length}/{disbursements.length}{" "}
          {t("contract.disbursement.tranches")}
          {/* 03/10: lịch theo loại chỉ là mặc định — "Chỉnh lịch" thêm / bớt / sửa từng đợt (đợt đã chi bị khoá),
              "Lập lại theo mẫu" về mặc định khi CHƯA chi đợt nào. Cả hai bắt lý do, ghi sổ quyết định. */}
          {canManage && (
            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setEditing(true)}>
              <PencilLine className="size-3.5" />
              {t("contract.disbursement.editSchedule")}
            </Button>
          )}
          {canManage && !anyPaid && (
            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setRegenerating(true)}>
              <RefreshCw className="size-3.5" />
              {t("contract.disbursement.regenerate")}
            </Button>
          )}
        </span>
      </div>

      {disbursements.map((d) => {
        const isDisbursed = d.status === DISBURSEMENT_STATUS.DISBURSED;
        // Có gắn sản phẩm mà sản phẩm chưa nghiệm thu Đạt ⇒ BE sẽ chặn (409).
        // Khoá nút ngay ở FE để Staff không bấm rồi mới ăn lỗi.
        const isBlocked = !isDisbursed && Boolean(d.isBlockedByDeliverable);
        const isMissingEvidence = !isDisbursed && !d.hasEvidence;
        const isLocked = !isDisbursed && Boolean(d.lockReason);
        const isReady = !isDisbursed && !isBlocked && !isLocked;

        return (
          <div key={d.id} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("contract.disbursement.tranche")} {d.roundNumber}
                  {/* Tỷ lệ % của đợt — BE tính sẵn từ mẫu giải ngân, trước 25/08 không hiện ở đâu. */}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">({d.percentage}%)</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.conditionDescription}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={d.status} />
                {/* Kế hoạch vs thực chi. `actualAmount` để trống nghĩa là Phòng Tài chính chưa báo
                    lại con số — khi đó chỉ hiện số kế hoạch, KHÔNG tự suy ra đã chi đúng bằng kế
                    hoạch (rule #15: hệ thống ghi nhận lại, không tự tính tiền). */}
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(d.actualAmount ?? d.plannedAmount)}
                </span>
                {d.actualAmount != null && d.actualAmount !== d.plannedAmount && (
                  <span className="text-[11px] text-muted-foreground">
                    {t("contract.disbursement.planned")}: {formatCurrency(d.plannedAmount)}
                  </span>
                )}
              </div>
            </div>

            {isDisbursed ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-success">
                  <CircleCheck className="size-3" />
                  {t("contract.disbursement.disbursedOn", { date: formatDate(d.disbursedAt) })}
                </span>
                {d.bankReference && (
                  <span>
                    {t("contract.disbursement.ref")} {d.bankReference}
                  </span>
                )}
                {d.notes && <span className="w-full">{d.notes}</span>}
                {canManage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-7 gap-1 px-2 text-xs"
                    onClick={() => setUndoing(d)}
                  >
                    <RotateCcw className="size-3.5" />
                    {t("contract.disbursement.undo")}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-start gap-1 text-xs ${isReady ? "text-success" : "text-muted-foreground"}`}
                >
                  {isLocked || isBlocked ? (
                    <Lock className="mt-0.5 size-3 shrink-0" />
                  ) : (
                    <Clock className="mt-0.5 size-3 shrink-0" />
                  )}
                  {isBlocked
                    ? t("contract.disbursement.blockedByProduct")
                    : isLocked
                      ? t("contract.disbursement.lockedBecause", { reason: d.lockReason })
                      : t("contract.disbursement.readyNow")}
                </span>
                {canManage && (
                  <Button
                    size="sm"
                    variant={isReady ? "default" : "outline"}
                    disabled={isBlocked || isLocked || isMissingEvidence}
                    title={
                      isBlocked
                        ? t("contract.disbursement.blockedByProduct")
                        : isLocked
                          ? (d.lockReason ?? undefined)
                          : isMissingEvidence
                            ? t("contract.disbursement.evidenceRequired")
                            : undefined
                    }
                    onClick={() => setConfirming(d)}
                  >
                    <BanknoteArrowUp />
                    {t("contract.disbursement.markDisbursed")}
                  </Button>
                )}
              </div>
            )}

            <DisbursementDeliverableLink contractId={contractId} disbursement={d} canManage={canManage} />
            <DisbursementEvidence disbursementId={d.id} canManage={canManage} />
          </div>
        );
      })}

      <DisbursementScheduleEditor
        open={editing}
        onOpenChange={setEditing}
        contractId={contractId}
        disbursements={disbursements}
      />
      <ReasonDialog
        open={regenerating}
        onOpenChange={setRegenerating}
        title={t("contract.disbursement.regenerateTitle")}
        description={t("contract.disbursement.regenerateDescription")}
        confirmLabel={t("contract.disbursement.regenerate")}
        isLoading={regenerateMutation.isPending}
        onConfirm={(reason) => regenerateMutation.mutate(reason, { onSuccess: () => setRegenerating(false) })}
      />
      <ReasonDialog
        open={Boolean(undoing)}
        onOpenChange={(open) => !open && setUndoing(null)}
        title={t("contract.disbursement.undoTitle", { n: undoing?.roundNumber ?? "" })}
        description={t("contract.disbursement.undoDescription")}
        confirmLabel={t("contract.disbursement.undo")}
        isLoading={undoMutation.isPending}
        onConfirm={(reason) =>
          undoing && undoMutation.mutate({ id: undoing.id, reason }, { onSuccess: () => setUndoing(null) })
        }
      />
      <ConfirmDisbursementDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        contractId={contractId}
        disbursement={confirming}
      />
    </div>
  );
}
