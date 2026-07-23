import { useMemo } from "react";
import { useContractsQuery } from "@/hooks/useContracts";
import { useMyProposalsQuery } from "@/hooks/useProposals";

/**
 * GET /contracts is already scoped server-side (PI sees only their own contracts, Staff/Admin see
 * all — confirmed live), so no client-side filtering is needed here. This hook just pairs the
 * (already-scoped) contract list with a proposalId -> title lookup for display.
 */
export function useMyContractsQuery() {
  const { data: myProposals, isLoading: isProposalsLoading } = useMyProposalsQuery();
  const { data: contracts, isLoading: isContractsLoading } = useContractsQuery();

  const proposalTitleById = useMemo(
    () => new Map((myProposals ?? []).map((p) => [p.id, p.titleEN || p.titleVI || p.id])),
    [myProposals]
  );

  return { data: contracts ?? [], proposalTitleById, isLoading: isProposalsLoading || isContractsLoading };
}
