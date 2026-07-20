import { useMemo, useState } from "react";
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
        proposalTitles,
        onView: (contract: Contract) => setDetailContractId(contract.id),
      }),
    [proposalTitles]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contracts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Research contracts for approved proposals and their progress-report schedule.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New contract
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search contracts..."
          exportFileName="contracts"
          emptyTitle="No contracts found"
          emptyDescription="Create a contract once a proposal has been approved."
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
