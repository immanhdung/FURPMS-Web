import { useQuery } from "@tanstack/react-query";
import { projectBudgetService } from "@/services/api/project-budget.service";
import { queryKeys } from "@/services/queryKeys";

export function useProjectBudgetQuery(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.projectBudget.overview(projectId ?? ""),
    queryFn: () => projectBudgetService.overview(projectId as string),
    enabled: Boolean(projectId),
  });
}
