import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { BudgetCategory, BudgetCategoryPayload } from "@/types/budget-category";

export const budgetCategoryService = {
  list: () =>
    axiosClient.get<ApiResponse<BudgetCategory[]>>("/budget-expense-categories").then((res) => res.data.data),

  create: (payload: BudgetCategoryPayload) =>
    axiosClient.post<ApiResponse<BudgetCategory>>("/budget-expense-categories", payload).then((res) => res.data.data),

  update: (id: number, payload: BudgetCategoryPayload) =>
    axiosClient
      .put<ApiResponse<BudgetCategory>>(`/budget-expense-categories/${id}`, payload)
      .then((res) => res.data.data),
};
