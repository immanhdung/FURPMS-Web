import { useQuery } from "@tanstack/react-query";
import { councilCandidateService } from "@/services/api/council-candidate.service";
import { queryKeys } from "@/services/queryKeys";

export function useCouncilCandidatesQuery(
  params: { councilId?: string; projectId?: string; trackId?: number },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.councilCandidates.list(params),
    queryFn: () => councilCandidateService.list(params),
    enabled: enabled && Boolean(params.councilId || params.projectId || params.trackId),
  });
}
