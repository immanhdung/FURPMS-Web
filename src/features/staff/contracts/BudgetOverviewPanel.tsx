import { useTranslation } from "react-i18next";
import { BanknoteArrowUp, Landmark, TriangleAlert, Wallet } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useProjectBudgetQuery } from "@/hooks/useProjectBudget";
import { formatCurrency, formatDate } from "@/utils/format";
import type { KpiDatum } from "@/types/dashboard";

/**
 * Bức tranh kinh phí của MỘT đề tài — trả lời yêu cầu số (1) của hội đồng bảo vệ lần 2:
 * *"cần thể hiện rõ ngân sách tương ứng cho các đề tài"*.
 *
 * <p>Dữ liệu vốn đã có đủ trong CSDL nhưng nằm rải ở 3 chỗ (dự toán đề cương · giá trị hợp đồng ·
 * các đợt giải ngân), muốn biết "đề tài này được cấp bao nhiêu, đã chi bao nhiêu, còn lại bao
 * nhiêu" thì phải mở 3 tab rồi cộng tay.</p>
 *
 * <p>Đúng rule #15 (sửa 25/08): bày <b>hồ sơ kinh phí</b> — kế hoạch và mốc — chứ hệ thống không
 * chi trả và không tính thay kế toán.</p>
 */
export function BudgetOverviewPanel({ projectId }: { projectId: string | null }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useProjectBudgetQuery(projectId);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const kpis: KpiDatum[] = [
    { id: "approved", label: t("budget.approvedTotal"), value: data.approvedTotal, format: "currency" },
    { id: "contracted", label: t("budget.contractedTotal"), value: data.contractedTotal, format: "currency" },
    { id: "disbursed", label: t("budget.disbursedTotal"), value: data.markedDisbursedTotal, format: "currency" },
    { id: "remaining", label: t("budget.remainingTotal"), value: data.remainingTotal, format: "currency" },
  ];

  // Tiến độ chi tính trên GIÁ TRỊ HỢP ĐỒNG, không phải trên dự toán: dự toán là con số xin, hợp
  // đồng mới là con số cam kết chi. Chưa ký hợp đồng thì không có gì để tính phần trăm.
  const disbursedPercent =
    data.contractedTotal > 0
      ? Math.min(100, Math.round((data.markedDisbursedTotal / data.contractedTotal) * 100))
      : 0;

  const headingsWithValue = data.approvedByHeading.filter((h) => h.amount > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((datum, index) => (
          <KpiCard key={datum.id} datum={datum} icon={index === 3 ? Wallet : Landmark} index={index} />
        ))}
      </div>

      {/* Trần kinh phí bị siết SAU khi duyệt là chuyện có thật (Phòng QLKH sửa master data) —
          phải nói ra chứ không im lặng, vì nó ảnh hưởng tới việc ký hợp đồng. */}
      {data.capExceeded && data.fundingCap != null && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            {t("budget.capExceeded", {
              total: formatCurrency(data.approvedTotal),
              cap: formatCurrency(data.fundingCap),
            })}
          </p>
        </div>
      )}

      {data.contractedTotal > 0 && (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{t("budget.disbursementProgress")}</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(data.markedDisbursedTotal)} / {formatCurrency(data.contractedTotal)}
            </span>
          </div>
          <ProgressBar value={disbursedPercent} />
          {/* Đã đánh dấu chi nhưng Phòng Tài chính chưa báo số thực ⇒ tổng đang là tạm tính.
              Không nói ra thì người đọc tưởng đây là số quyết toán. */}
          {data.hasUnreportedActuals && (
            <p className="text-xs text-muted-foreground">{t("budget.estimatedNote")}</p>
          )}
        </div>
      )}

      {/* ── Cơ cấu dự toán theo 06 hạng mục QĐ543 Điều 15 ── */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">{t("budget.byHeading")}</h3>
        {headingsWithValue.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("budget.noBudget")}</p>
        ) : (
          <ul className="space-y-2 rounded-lg border border-border p-3">
            {headingsWithValue.map((h) => (
              <li key={h.code} className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="text-foreground">{t(`budget.heading.${h.code}`, { defaultValue: h.code })}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(h.amount)} · {h.percentage}%
                  </span>
                </div>
                <ProgressBar value={h.percentage} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Các đợt giải ngân ── */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">{t("budget.tranches")}</h3>
        {data.tranches.length === 0 ? (
          <EmptyState
            icon={BanknoteArrowUp}
            title={t("budget.noTranches")}
            description={t("budget.noTranchesDesc")}
            className="min-h-24 border-none p-3"
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.tranches.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {t("budget.tranche", { n: d.roundNumber })} ({d.percentage}%)
                  </p>
                  <p className="truncate text-muted-foreground">{d.conditionDescription}</p>
                  {d.isBlockedByDeliverable && (
                    <p className="text-warning">{t("budget.blockedByProduct")}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-medium text-foreground">
                    {formatCurrency(d.actualAmount ?? d.plannedAmount)}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Quyết toán (BM13) ── */}
      {data.settlement && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">{t("budget.settlement")}</h3>
          <div className="grid gap-2 rounded-lg border border-border p-3 text-xs sm:grid-cols-3">
            <Figure label={t("budget.settlementContracted")} value={formatCurrency(data.settlement.totalContractedAmount)} />
            <Figure label={t("budget.settlementDisbursed")} value={formatCurrency(data.settlement.totalDisbursedAmount)} />
            <Figure label={t("budget.settlementReturned")} value={formatCurrency(data.settlement.totalReturnedAmount)} />
            {data.settlement.settlementSignedAt && (
              <p className="text-muted-foreground sm:col-span-3">
                {t("budget.settlementSignedAt", { date: formatDate(data.settlement.settlementSignedAt) })}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Câu này giữ đúng ranh giới rule #15 — và cũng là câu trả lời sẵn cho hội đồng nếu bị hỏi
          "hệ thống có quản lý tiền không". */}
      <p className="text-xs text-muted-foreground">{t("budget.scopeNote")}</p>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="tabular-nums font-medium text-foreground">{value}</p>
    </div>
  );
}
