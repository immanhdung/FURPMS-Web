import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "@/services/api/feedback.service";
import { queryKeys } from "@/services/queryKeys";

/** Reviewers no longer submit feedback via a form — this is read-only, for the minutes panel. */
export function useFeedbackListQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.feedback.list(councilId ?? ""),
    queryFn: () => feedbackService.list(councilId as string),
    enabled: Boolean(councilId),
  });
}
