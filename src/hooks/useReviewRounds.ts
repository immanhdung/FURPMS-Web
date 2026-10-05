import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { reviewRoundService } from "@/services/api/review-round.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CloseRoundPayload, CreateReviewRoundPayload } from "@/types/review-round";

export function useReviewRoundsQuery(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.reviewRounds.list(proposalId ?? ""),
    queryFn: () => reviewRoundService.list(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

export function useCreateReviewRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewRoundPayload) => reviewRoundService.create(proposalId, payload),
    onSuccess: () => {
      toast.success("Review round created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create review round."),
  });
}

export function useOpenRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: string) => reviewRoundService.open(roundId),
    onSuccess: () => {
      toast.success("Round opened.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to open round."),
  });
}

/**
 * Đặt/dời hạn chấm của một vòng.
 *
 * `invalidateKeys` mặc định làm mới đúng danh sách vòng của MỘT đề cương (`ProposalReviewWorkspace`
 * gọi kiểu này). Màn "Hội đồng & Chấm" chấm cả một track cùng lúc nên không có `proposalId` — nó
 * truyền thẳng `queryKeys.reviewBoard.board(cycleId, trackId)` để làm mới đúng dữ liệu đang xem,
 * thay vì phải giả một `proposalId` không có ý nghĩa gì ở màn đó.
 */
export function useSetRoundDeadlineMutation(invalidateKeys: readonly (readonly unknown[])[]) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: { scoringDeadline: string; reason?: string } }) =>
      reviewRoundService.setDeadline(roundId, payload),
    onSuccess: () => {
      toast.success(t("roundDeadline.saved"));
      invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    // Câu lỗi của BE đã nêu rõ vướng gì (vd "đã có hạn — dời hạn thì phải ghi rõ lý do"),
    // hiện nguyên văn thay vì nuốt đi rồi in câu chung chung.
    onError: (error: ApiError) => toast.error(error.message || t("roundDeadline.saveFailed")),
  });
}

export function useCloseRoundMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: CloseRoundPayload }) =>
      reviewRoundService.close(roundId, payload),
    onSuccess: () => {
      toast.success("Round closed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviewRounds.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to close round."),
  });
}
