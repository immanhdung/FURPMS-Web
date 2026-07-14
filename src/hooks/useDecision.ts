import { useQuery } from "@tanstack/react-query";
import { decisionService } from "@/services/api/decision.service";
import { queryKeys } from "@/services/queryKeys";

export function useDecisionQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.decision.detail(councilId ?? ""),
    queryFn: () => decisionService.get(councilId as string),
    enabled: Boolean(councilId),
    retry: false,
  });
}
