import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { amendmentService } from "@/services/api/amendment.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateAmendmentPayload } from "@/types/amendment";

export function useAmendmentsQuery(contractId: string | null) {
  return useQuery({
    queryKey: queryKeys.amendments.list(contractId ?? ""),
    queryFn: () => amendmentService.listByContract(contractId as string),
    enabled: Boolean(contractId),
  });
}

export function useAmendmentCategoriesQuery() {
  return useQuery({
    queryKey: [...queryKeys.amendments.all(), "categories"],
    queryFn: amendmentService.listCategories,
    staleTime: 10 * 60 * 1000,
  });
}

function useAmendmentAction<TArgs>(
  contractId: string,
  action: (args: TArgs) => Promise<unknown>,
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.amendments.list(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || errorMessage),
  });
}

export function useCreateAmendmentMutation(contractId: string) {
  return useAmendmentAction<CreateAmendmentPayload>(
    contractId,
    (payload) => amendmentService.create(contractId, payload),
    "Amendment request submitted.",
    "Unable to submit the amendment request."
  );
}

export function useApproveAmendmentMutation(contractId: string) {
  return useAmendmentAction<{ id: string; reviewerComments?: string }>(
    contractId,
    ({ id, reviewerComments }) => amendmentService.approve(id, reviewerComments),
    "Amendment approved.",
    "Unable to approve the amendment."
  );
}

export function useRejectAmendmentMutation(contractId: string) {
  return useAmendmentAction<{ id: string; reviewerComments?: string }>(
    contractId,
    ({ id, reviewerComments }) => amendmentService.reject(id, reviewerComments),
    "Amendment rejected.",
    "Unable to reject the amendment."
  );
}
