import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FileSignature, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useContractsQuery, useDeleteContractMutation } from "@/hooks/useContracts";
import { useProposalsQuery } from "@/hooks/useProposals";
import { getContractColumns } from "@/features/staff/contracts/columns";
import { CreateContractSheet } from "@/features/staff/contracts/CreateContractSheet";
import { ContractDetailSheet } from "@/features/staff/contracts/ContractDetailSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sortByDateDesc } from "@/utils/sort";
import type { Contract } from "@/types/contract";

import { proposalTitle } from "@/utils/format";
export function ContractsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useContractsQuery();
  const { data: proposals } = useProposalsQuery();
  const sortedData = useMemo(() => sortByDateDesc(data, (c) => c.createdAt), [data]);
  const [researchType, setResearchType] = useState("all");
  const [cycle, setCycle] = useState("all");
  const [track, setTrack] = useState("all");

  const options = useMemo(() => ({
    researchTypes: Array.from(new Map((data ?? []).filter((x) => x.researchTypeId).map((x) => [x.researchTypeId, x.researchTypeName || x.researchTypeCode || "-"])).entries()),
    cycles: Array.from(new Map((data ?? []).filter((x) => x.cycleId).map((x) => [x.cycleId, x.cycleCode || "-"])).entries()),
    tracks: Array.from(new Map((data ?? []).filter((x) => x.trackId).map((x) => [x.trackId, x.trackName || x.trackCode || "-"])).entries()),
  }), [data]);

  const filteredData = useMemo(() => sortedData.filter((contract) =>
    (researchType === "all" || String(contract.researchTypeId) === researchType) &&
    (cycle === "all" || String(contract.cycleId) === cycle) &&
    (track === "all" || String(contract.trackId) === track)
  ), [sortedData, researchType, cycle, track]);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailContractId, setDetailContractId] = useState<string | null>(null);
  // Cùng một sheet dùng cho tạo và sửa — có `editing` là chế độ sửa.
  const [editing, setEditing] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<Contract | null>(null);
  const deleteMutation = useDeleteContractMutation();

  const proposalTitles = useMemo(
    () => Object.fromEntries((proposals ?? []).map((p) => [p.id, proposalTitle(p, p.id)])),
    [proposals]
  );

  const columns = useMemo(
    () =>
      getContractColumns({
        t,
        proposalTitles,
        onView: (contract: Contract) => setDetailContractId(contract.id),
        onEdit: (contract: Contract) => setEditing(contract),
        onDelete: (contract: Contract) => setDeleting(contract),
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={researchType} onValueChange={setResearchType}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("staff.contractAllResearchTypes")}</SelectItem>
                {options.researchTypes.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={cycle} onValueChange={setCycle}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("staff.contractAllCycles")}</SelectItem>
                {options.cycles.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("staff.contractAllTracks")}</SelectItem>
                {options.tracks.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            searchPlaceholder={t("staff.contractsSearch")}
            exportFileName="contracts"
            emptyTitle={t("staff.noContracts")}
            emptyDescription={t("staff.noContractsDesc")}
          />
        </div>
      )}

      <CreateContractSheet open={createOpen} onOpenChange={setCreateOpen} />

      <CreateContractSheet
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        contract={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("contract.deleteTitle")}
        description={t("contract.deleteConfirm", { number: deleting?.contractNumber ?? "" })}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />

      <ContractDetailSheet
        open={Boolean(detailContractId)}
        onOpenChange={(open) => !open && setDetailContractId(null)}
        contractId={detailContractId}
      />
    </div>
  );
}
