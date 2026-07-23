import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { proposalService } from "@/services/api/proposal.service";
import { queryKeys } from "@/services/queryKeys";
import type { ProposalListParams } from "@/types/proposal-summary";
import type { ProposalPayload } from "@/types/proposal-detail";
import type { ApiError } from "@/types/common";

export function useProposalsQuery(params?: ProposalListParams) {
  return useQuery({
    queryKey: queryKeys.proposals.list(params as Record<string, unknown> | undefined),
    queryFn: () => proposalService.list(params),
  });
}

export function useMyProposalsQuery() {
  return useQuery({
    queryKey: queryKeys.proposals.mine(),
    queryFn: proposalService.mine,
  });
}

export function useProposalQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id ?? ""),
    queryFn: () => proposalService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProposalPayload) => proposalService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.mine() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to save proposal."),
  });
}

export function useUpdateProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProposalPayload }) => proposalService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.detail(variables.id) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to save proposal."),
  });
}

export function useSubmitProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirmCv }: { id: string; confirmCv: boolean }) => proposalService.submit(id, confirmCv),
    onSuccess: (_data, variables) => {
      toast.success("Proposal submitted for review.");
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.detail(variables.id) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit proposal."),
  });
}

export function useWithdrawProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalService.withdraw(id),
    onSuccess: (_data, id) => {
      toast.success("Proposal withdrawn.");
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.detail(id) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to withdraw proposal."),
  });
}

export function useExportScientificMutation() {
  return useMutation({
    mutationFn: ({ id, titleSlug }: { id: string; titleSlug: string }) =>
      proposalService.exportScientific(id, titleSlug),
    onSuccess: () => toast.success("Thuyết minh đã được xuất thành công."),
    onError: (error: ApiError) => toast.error(error.message || "Failed to export scientific report."),
  });
}

export function useExportBudgetMutation() {
  return useMutation({
    mutationFn: ({ id, titleSlug }: { id: string; titleSlug: string }) =>
      proposalService.exportBudget(id, titleSlug),
    onSuccess: () => toast.success("Dự toán kinh phí đã được xuất thành công."),
    onError: (error: ApiError) => toast.error(error.message || "Failed to export budget report."),
  });
}
