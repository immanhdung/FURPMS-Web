import { useMemo } from "react";
import { useContractsQuery } from "@/hooks/useContracts";
import { useMyProposalsQuery } from "@/hooks/useProposals";

/**
 * There's no PI-scoped contracts endpoint (GET /contracts takes no proposalId/mine filter), so
 * "my contracts" is derived client-side: fetch all contracts, keep the ones whose proposalId is
 * one of the PI's own proposals. If GET /contracts turns out to be Staff/Admin-only server-side,
 * this will surface as a 403 on the underlying query — that would need a backend fix, not a
 * frontend one.
 */
export function useMyContractsQuery() {
  const { data: myProposals, isLoading: isProposalsLoading } = useMyProposalsQuery();
  const { data: contracts, isLoading: isContractsLoading } = useContractsQuery();

  const proposalTitleById = useMemo(
    () => new Map((myProposals ?? []).map((p) => [p.id, p.titleEN || p.titleVI || p.id])),
    [myProposals]
  );

  const myContracts = useMemo(
    () => (contracts ?? []).filter((c) => proposalTitleById.has(c.proposalId)),
    [contracts, proposalTitleById]
  );

  return { data: myContracts, proposalTitleById, isLoading: isProposalsLoading || isContractsLoading };
}
