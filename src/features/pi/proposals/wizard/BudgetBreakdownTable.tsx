import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useBudgetCategoriesQuery } from "@/hooks/useBudgetCategories";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

/**
 * Dự toán kinh phí theo **06 hạng mục của QĐ543 Điều 15.1**, kèm tỷ lệ tối đa từng hạng mục
 * (thù lao 100% · thiết bị 60% · thuê ngoài 60% · hội thảo 30% · VPP &amp; chi khác 20% ·
 * phát sinh/SHTT 10%) và trần tổng của **Điều 14** (cơ bản ≤100tr · ứng dụng ≤150tr).
 *
 * <p>Tổng **không nhập tay** mà cộng từ các hạng mục — trước đây hai con số này ở hai chỗ khác nhau
 * nên luôn có nguy cơ lệch. Tỷ lệ tính trên chính tổng đó, đúng câu chữ *"tính trên tổng kinh phí
 * đề tài"* của Điều 15.</p>
 */
export function BudgetBreakdownTable({
  form,
  cap,
  capType,
}: {
  form: UseFormReturn<ProposalWizardValues>;
  cap: number | null;
  capType: string;
}) {
  const { t } = useTranslation();
  const { data: categories } = useBudgetCategoriesQuery();
  const { setValue, watch } = form;

  const active = (categories ?? []).filter((c) => c.isActive).sort((a, b) => a.sequence - b.sequence);
  const items = watch("budgetItems") ?? [];
  const amountOf = (code: string) => items.find((i) => i.category === code)?.amount ?? 0;

  const total = items.reduce((sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0), 0);
  const overCap = cap != null && total > cap;

  const setAmount = (code: string, raw: string) => {
    const amount = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(amount) || amount < 0) return;
    const next = items.filter((i) => i.category !== code);
    if (amount > 0) next.push({ category: code, amount });
    setValue("budgetItems", next, { shouldDirty: true });
  };

  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t("wizard.step3.budgetCategory")}</th>
              <th className="w-28 px-3 py-2 text-right font-medium">{t("wizard.step3.budgetMaxPct")}</th>
              <th className="w-44 px-3 py-2 text-right font-medium">{t("wizard.step3.budgetAmount")}</th>
              <th className="w-24 px-3 py-2 text-right font-medium">{t("wizard.step3.budgetShare")}</th>
            </tr>
          </thead>
          <tbody>
            {active.map((c) => {
              const amount = amountOf(c.code);
              const share = total > 0 ? (amount / total) * 100 : 0;
              // Tỷ lệ chỉ có nghĩa khi đã có tổng; tổng 0 thì đừng bôi đỏ cả bảng.
              const over = c.maxPercentage != null && total > 0 && share > c.maxPercentage;
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{c.name}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {c.maxPercentage != null ? `${c.maxPercentage}%` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      id={`budget-${c.code}`}
                      type="number"
                      min={0}
                      step={1_000_000}
                      className="text-right"
                      aria-invalid={over}
                      value={amount || ""}
                      onChange={(e) => setAmount(c.code, e.target.value)}
                    />
                  </td>
                  <td className={cn("px-3 py-2 text-right", over ? "font-medium text-destructive" : "text-muted-foreground")}>
                    {total > 0 ? `${share.toFixed(1)}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-border bg-muted/30">
            <tr>
              <td className="px-3 py-2 font-medium text-foreground" colSpan={2}>
                {t("wizard.step3.budgetTotal")}
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right font-semibold",
                  overCap ? "text-destructive" : "text-foreground"
                )}
              >
                {formatCurrency(total)}
              </td>
              <td className="px-3 py-2 text-right text-muted-foreground">{total > 0 ? "100%" : "—"}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {cap != null && (
        <p className={cn("text-xs", overCap ? "text-destructive" : "text-muted-foreground")}>
          {overCap
            ? t("wizard.step3.totalBudgetOverCap", { cap: formatCurrency(cap) })
            : t("wizard.step3.totalBudgetHint", { cap: formatCurrency(cap), type: capType })}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t("wizard.step3.budgetPctHint")}</p>
    </div>
  );
}
