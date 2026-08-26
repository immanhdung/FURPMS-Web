import { useQuery } from "@tanstack/react-query";
import { projectDecisionService } from "@/services/api/project-decision.service";
import { queryKeys } from "@/services/queryKeys";

export function useProjectDecisionsQuery(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.projectDecisions.detail(projectId ?? ""),
    queryFn: () => projectDecisionService.get(projectId as string),
    enabled: Boolean(projectId),
  });
}
