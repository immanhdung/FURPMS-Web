import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetCategoryService } from "@/services/api/budget-category.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { BudgetCategoryPayload } from "@/types/budget-category";

export function useBudgetCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.budgetCategories.list(),
    queryFn: budgetCategoryService.list,
  });
}

export function useCreateBudgetCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetCategoryPayload) => budgetCategoryService.create(payload),
    onSuccess: () => {
      toast.success("Budget category created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create budget category."),
  });
}

export function useUpdateBudgetCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BudgetCategoryPayload }) =>
      budgetCategoryService.update(id, payload),
    onSuccess: () => {
      toast.success("Budget category updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update budget category."),
  });
}
