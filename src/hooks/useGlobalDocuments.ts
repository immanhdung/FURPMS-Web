import { useQuery } from "@tanstack/react-query";
import { globalDocumentService } from "@/services/api/global-document.service";
import type { PaginationParams } from "@/types/common";

export const globalDocumentKeys = {
  all: ["global-documents"] as const,
  list: (params?: PaginationParams) => ["global-documents", "list", params] as const,
  byProposal: (proposalId: string) => ["global-documents", "proposal", proposalId] as const,
};

export function useGlobalDocumentsQuery(params?: PaginationParams) {
  return useQuery({
    queryKey: globalDocumentKeys.list(params),
    queryFn: () => globalDocumentService.list(params),
  });
}

export function useDocumentsByProposalQuery(proposalId: string | null) {
  return useQuery({
    queryKey: globalDocumentKeys.byProposal(proposalId ?? ""),
    queryFn: () => globalDocumentService.listByProposal(proposalId as string),
    enabled: Boolean(proposalId),
  });
}
