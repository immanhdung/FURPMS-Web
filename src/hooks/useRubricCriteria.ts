import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rubricCriterionService } from "@/services/api/rubric-criterion.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { RubricCriterionPayload } from "@/types/rubric-criterion";

export function useRubricCriteriaQuery(roundType?: string) {
  return useQuery({
    queryKey: queryKeys.rubricCriteria.list(roundType),
    queryFn: () => rubricCriterionService.list(roundType),
  });
}

export function useCreateRubricCriterionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RubricCriterionPayload) => rubricCriterionService.create(payload),
    onSuccess: () => {
      toast.success("Rubric criterion created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.rubricCriteria.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create rubric criterion."),
  });
}

export function useUpdateRubricCriterionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RubricCriterionPayload }) =>
      rubricCriterionService.update(id, payload),
    onSuccess: () => {
      toast.success("Rubric criterion updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.rubricCriteria.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update rubric criterion."),
  });
}

export function useDeleteRubricCriterionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rubricCriterionService.remove(id),
    onSuccess: () => {
      toast.success("Rubric criterion deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.rubricCriteria.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to delete rubric criterion."),
  });
}
