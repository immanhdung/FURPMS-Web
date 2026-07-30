import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FileSignature, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useContractsQuery } from "@/hooks/useContracts";
import { useProposalsQuery } from "@/hooks/useProposals";
import { getContractColumns } from "@/features/staff/contracts/columns";
import { CreateContractSheet } from "@/features/staff/contracts/CreateContractSheet";
import { ContractDetailSheet } from "@/features/staff/contracts/ContractDetailSheet";
import { sortByDateDesc } from "@/utils/sort";
import type { Contract } from "@/types/contract";

export function ContractsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useContractsQuery();
  const { data: proposals } = useProposalsQuery();
  const sortedData = useMemo(() => sortByDateDesc(data, (c) => c.createdAt), [data]);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailContractId, setDetailContractId] = useState<string | null>(null);

  const proposalTitles = useMemo(
    () => Object.fromEntries((proposals ?? []).map((p) => [p.id, p.titleEN || p.titleVI || p.id])),
    [proposals]
  );

  const columns = useMemo(
    () =>
      getContractColumns({
        t,
        proposalTitles,
        onView: (contract: Contract) => setDetailContractId(contract.id),
      }),
    [t, proposalTitles]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <FileSignature className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.contractsTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("staff.contractsSubtitle")}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("staff.newContract")}
        </Button>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedData}
          isLoading={isLoading}
          searchPlaceholder={t("staff.contractsSearch")}
          exportFileName="contracts"
          emptyTitle={t("staff.noContracts")}
          emptyDescription={t("staff.noContractsDesc")}
        />
      )}

      <CreateContractSheet open={createOpen} onOpenChange={setCreateOpen} />

      <ContractDetailSheet
        open={Boolean(detailContractId)}
        onOpenChange={(open) => !open && setDetailContractId(null)}
        contractId={detailContractId}
      />
    </div>
  );
}
