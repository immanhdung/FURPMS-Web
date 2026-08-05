import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ChevronDown, ChevronRight, Route } from "lucide-react";
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
  // null = chưa bấm gì (dùng mặc định); "" = đã chủ động đóng hết.
  const [openId, setOpenId] = useState<string | null>(null);

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
          {contracts.map((contract) => {
            // Mặc định MỞ khi chỉ có 1 hợp đồng; nhiều hợp đồng thì thu gọn cho dễ nhìn —
            // một đề tài có thể có nhiều hợp đồng theo giai đoạn, và PI có thể có nhiều đề tài.
            const isOpen = openId === contract.id || (openId === null && contracts.length === 1);
            return (
              <section key={contract.id} className="rounded-xl border border-border bg-card/95">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left"
                  onClick={() => setOpenId(isOpen ? "" : contract.id)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {proposalTitleById.get(contract.proposalId) || t("myTimeline.untitled")}
                      </span>
                      {contract.contractNumber && (
                        <span className="block text-xs text-muted-foreground">
                          {t("reports.contractNo", { no: contract.contractNumber })}
                        </span>
                      )}
                    </span>
                  </span>
                  <StatusBadge status={contract.status} />
                </button>

                {/* Tái dùng đúng timeline của màn Staff — cùng một nguồn sự thật, khỏi lệch. */}
                {isOpen && (
                  <div className="px-4 pb-4">
                    <ContractMilestoneTimeline contract={contract} />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
