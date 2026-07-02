import { useQuery } from "@tanstack/react-query";
import { proposalService } from "@/services/api/proposal.service";
import { queryKeys } from "@/services/queryKeys";
import type { ProposalListParams } from "@/types/proposal-summary";

export function useProposalsQuery(params?: ProposalListParams) {
  return useQuery({
    queryKey: queryKeys.proposals.list(params as Record<string, unknown> | undefined),
    queryFn: () => proposalService.list(params),
  });
}

export function useProposalQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id ?? ""),
    queryFn: () => proposalService.getById(id as string),
    enabled: Boolean(id),
  });
}
