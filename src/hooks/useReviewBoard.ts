import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewBoardService } from "@/services/api/review-board.service";
import { reviewRoundService } from "@/services/api/review-round.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateCouncilPackagePayload, CreateTrackRoundPayload } from "@/types/review-board";

export function useReviewBoardQuery(cycleId?: number, trackId?: number) {
  return useQuery({
    queryKey: queryKeys.reviewBoard.board(cycleId ?? 0, trackId ?? 0),
    queryFn: () => reviewBoardService.getBoard(cycleId as number, trackId as number),
    enabled: Boolean(cycleId) && Boolean(trackId),
  });
}

/** Mọi mutation của board đều làm mới lại đúng board (cycleId, trackId) đang xem. */
function useInvalidateBoard(cycleId?: number, trackId?: number) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reviewBoard.board(cycleId ?? 0, trackId ?? 0) });
}

export function useCreateTrackRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (payload: CreateTrackRoundPayload) =>
      reviewBoardService.createRound(cycleId as number, trackId as number, payload),
    onSuccess: () => {
      toast.success("Đã tạo vòng chấm.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không tạo được vòng chấm."),
  });
}

export function useOpenBoardRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (roundId: string) => reviewRoundService.open(roundId),
    onSuccess: () => {
      toast.success("Đã mở vòng.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không mở được vòng."),
  });
}

export function useDeleteRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (roundId: string) => reviewBoardService.deleteRound(roundId),
    onSuccess: () => {
      toast.success("Đã xóa vòng.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không xóa được vòng."),
  });
}

export function useAddProjectToRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, projectId }: { roundId: string; projectId: string }) =>
      reviewBoardService.addProject(roundId, projectId),
    onSuccess: () => {
      toast.success("Đã thêm đề tài vào vòng.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không thêm được đề tài."),
  });
}

export function useRemoveProjectFromRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, projectId }: { roundId: string; projectId: string }) =>
      reviewBoardService.removeProject(roundId, projectId),
    onSuccess: () => {
      toast.success("Đã gỡ đề tài khỏi vòng.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không gỡ được đề tài."),
  });
}

export function useCreateCouncilPackageMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: CreateCouncilPackagePayload }) =>
      reviewBoardService.createCouncilPackage(roundId, payload),
    onSuccess: () => {
      toast.success("Đã tạo hội đồng.");
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || "Không tạo được hội đồng."),
  });
}
