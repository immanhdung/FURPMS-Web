import { useQuery } from "@tanstack/react-query";
import { myDeadlinesService } from "@/services/api/my-deadlines.service";
import { queryKeys } from "@/services/queryKeys";

export function useMyDeadlinesQuery(days = 30) {
  return useQuery({
    queryKey: queryKeys.myDeadlines.list(days),
    queryFn: () => myDeadlinesService.list(days),
  });
}
