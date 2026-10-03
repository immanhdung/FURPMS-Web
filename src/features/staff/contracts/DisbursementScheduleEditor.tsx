import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSaveDisbursementScheduleMutation } from "@/hooks/useDisbursements";
import { DISBURSEMENT_STATUS, type Disbursement } from "@/types/disbursement";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface Row {
  key: string;
  id?: number;
  percentage: string;
  condition: string;
  paid: boolean;
}

const toRows = (items: Disbursement[]): Row[] =>
  [...items]
    .sort((a, b) => a.roundNumber - b.roundNumber)
    .map((d) => ({
      key: String(d.id),
      id: d.id,
      percentage: String(d.percentage),
      condition: d.conditionDescription ?? "",
      paid: d.status === DISBURSEMENT_STATUS.DISBURSED,
    }));

/**
 * Chỉnh cả lịch giải ngân của một hợp đồng (03/10). Lịch theo loại đề tài (Cơ bản 1 đợt / Ứng dụng 4 đợt) chỉ là
 * MẶC ĐỊNH — Phòng QLKH thêm / bớt / đổi thứ tự / sửa tỉ lệ và điều kiện khi có quyết định khác. Đợt đã chi bị
 * khoá; tổng phải đúng 100%; bắt buộc lý do (ghi sổ quyết định "trước → sau").
 */
export function DisbursementScheduleEditor({
  open,
  onOpenChange,
  contractId,
  disbursements,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  disbursements: Disbursement[];
}) {
  const { t } = useTranslation();
  const save = useSaveDisbursementScheduleMutation(contractId);
  const [rows, setRows] = useState<Row[]>(() => toRows(disbursements));
  const [reason, setReason] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRows(toRows(disbursements));
      setReason("");
    }
  }

  // Tổng giá trị hợp đồng = tổng kế hoạch các đợt hiện có (BE luôn giữ khớp).
  const total = disbursements.reduce((s, d) => s + (d.plannedAmount ?? 0), 0);
  const sum = rows.reduce((s, r) => s + (Number(r.percentage) || 0), 0);
  const sumOk = Math.abs(sum - 100) <= 0.01;
  const rowsOk = rows.length > 0 && rows.every((r) => Number(r.percentage) > 0 && Number(r.percentage) <= 100);

  const update = (key: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (index: number, delta: number) =>
    setRows((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length || next[index].paid || next[target].paid) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("contract.disbursement.editTitle")}</DialogTitle>
          <DialogDescription>{t("contract.disbursement.editDescription")}</DialogDescription>
        </DialogHeader>

        <ol className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <li
              key={r.key}
              className={cn(
                "grid grid-cols-[auto_6rem_1fr_auto] items-start gap-2 rounded-lg border p-2",
                r.paid ? "border-border bg-muted/50" : "border-border"
              )}
            >
              <span className="pt-2 text-xs font-medium text-muted-foreground tabular-nums">
                {t("contract.disbursement.tranche")} {i + 1}
              </span>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  inputMode="decimal"
                  value={r.percentage}
                  disabled={r.paid}
                  aria-label={t("contract.disbursement.percentLabel", { n: i + 1 })}
                  className="pr-6 tabular-nums"
                  onChange={(e) => update(r.key, { percentage: e.target.value })}
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                  %
                </span>
                {total > 0 && Number(r.percentage) > 0 && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    ≈ {formatCurrency(Math.round((total * Number(r.percentage)) / 100))}
                  </p>
                )}
              </div>
              <Input
                value={r.condition}
                disabled={r.paid}
                placeholder={t("contract.disbursement.conditionPlaceholder")}
                aria-label={t("contract.disbursement.conditionLabel", { n: i + 1 })}
                onChange={(e) => update(r.key, { condition: e.target.value })}
              />
              <div className="flex items-center">
                {r.paid ? (
                  <span
                    className="flex items-center gap-1 px-2 pt-2 text-xs text-muted-foreground"
                    title={t("contract.disbursement.paidLocked")}
                  >
                    <Lock className="size-3.5" />
                    {t("contract.disbursement.paidShort")}
                  </span>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("contract.disbursement.moveUp")}
                      disabled={i === 0 || rows[i - 1].paid}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("contract.disbursement.moveDown")}
                      disabled={i === rows.length - 1 || rows[i + 1].paid}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("contract.disbursement.removeTranche")}
                      disabled={rows.length === 1}
                      onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}
                    >
                      <Trash2 className="text-danger" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={rows.length >= 12}
            onClick={() =>
              setRows((prev) => [...prev, { key: `new-${Date.now()}`, percentage: "", condition: "", paid: false }])
            }
          >
            <Plus />
            {t("contract.disbursement.addTranche")}
          </Button>
          <span className={cn("text-sm font-medium tabular-nums", sumOk ? "text-success" : "text-destructive")}>
            {t("contract.disbursement.sumLabel", { sum: Number(sum.toFixed(2)) })}
          </span>
        </div>

        <div>
          <label htmlFor="disb-reason" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("common.reasonRequired")}
          </label>
          <Textarea id="disb-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <p className="mt-1.5 text-xs text-muted-foreground">{t("common.reasonLogged")}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={save.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={save.isPending || !sumOk || !rowsOk || !reason.trim()}
            onClick={() =>
              save.mutate(
                {
                  reason: reason.trim(),
                  rows: rows.map((r) => ({
                    id: r.id,
                    percentage: Number(r.percentage),
                    conditionDescription: r.condition.trim() || null,
                  })),
                },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {save.isPending && <Loader2 className="animate-spin" />}
            {t("contract.disbursement.saveSchedule")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
