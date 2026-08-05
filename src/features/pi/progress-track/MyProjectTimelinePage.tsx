import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Route } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import { ContractMilestoneTimeline } from "@/features/staff/contracts/ContractMilestoneTimeline";

/**
 * PI xem TIẾN TRÌNH đề tài của chính mình.
 *
 * Trước đây timeline mốc (ký HĐ → báo cáo tiến độ → giải ngân → kết thúc) **chỉ có ở màn
 * Hợp đồng của Staff**. Nên sau khi hội đồng nghiệm thu Đạt và Chủ tịch chốt biên bản,
 * đề tài chuyển `COMPLETED` mà **không màn nào nói cho PI biết** — chính chủ đề tài lại
 * là người mù thông tin nhất.
 */
export function MyProjectTimelinePage() {
  const { t } = useTranslation();
  const { data: contracts, proposalTitleById, isLoading } = useMyContractsQuery();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
          <Route className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("myTimeline.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("myTimeline.subtitle")}</p>
        </div>
      </motion.div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={Route}
          title={t("myTimeline.empty")}
          description={t("myTimeline.emptyDesc")}
        />
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => (
            <section key={contract.id} className="space-y-3 rounded-xl border border-border bg-card/95 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {proposalTitleById.get(contract.proposalId) || t("myTimeline.untitled")}
                  </p>
                  {contract.contractNumber && (
                    <p className="text-xs text-muted-foreground">
                      {t("reports.contractNo", { no: contract.contractNumber })}
                    </p>
                  )}
                </div>
                <StatusBadge status={contract.status} />
              </div>

              {/* Tái dùng đúng timeline của màn Staff — cùng một nguồn sự thật, khỏi lệch. */}
              <ContractMilestoneTimeline contract={contract} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
