import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useContractsQuery } from "@/hooks/useContracts";
import { useProposalsQuery } from "@/hooks/useProposals";
import { getContractColumns } from "@/features/staff/contracts/columns";
import { CreateContractSheet } from "@/features/staff/contracts/CreateContractSheet";
import { ContractDetailSheet } from "@/features/staff/contracts/ContractDetailSheet";
import type { Contract } from "@/types/contract";

export function ContractsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useContractsQuery();
  const { data: proposals } = useProposalsQuery();

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.contractsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("staff.contractsSubtitle")}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("staff.newContract")}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
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
