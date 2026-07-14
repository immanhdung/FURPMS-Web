import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedbackService } from "@/services/api/feedback.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { FeedbackPayload } from "@/types/feedback";

export function useFeedbackListQuery(councilId: string | null) {
  return useQuery({
    queryKey: queryKeys.feedback.list(councilId ?? ""),
    queryFn: () => feedbackService.list(councilId as string),
    enabled: Boolean(councilId),
  });
}

export function useSubmitFeedbackMutation(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FeedbackPayload) => feedbackService.submit(councilId, payload),
    onSuccess: () => {
      toast.success("Feedback submitted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.list(councilId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to submit feedback."),
  });
}
