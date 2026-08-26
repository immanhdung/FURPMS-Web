import { useQuery } from "@tanstack/react-query";
import { projectTimelineService } from "@/services/api/project-timeline.service";
import { queryKeys } from "@/services/queryKeys";

export function useProjectTimelineQuery(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.projectTimeline.detail(projectId ?? ""),
    queryFn: () => projectTimelineService.get(projectId as string),
    enabled: Boolean(projectId),
  });
}
