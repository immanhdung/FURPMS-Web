import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
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
      toast.success(i18n.t("toast.roundCreated"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.roundCreateFailed")),
  });
}

export function useOpenBoardRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (roundId: string) => reviewRoundService.open(roundId),
    onSuccess: () => {
      toast.success(i18n.t("toast.roundOpened"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.roundOpenFailed")),
  });
}

export function useDeleteRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (roundId: string) => reviewBoardService.deleteRound(roundId),
    onSuccess: () => {
      toast.success(i18n.t("toast.roundDeleted"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.roundDeleteFailed")),
  });
}

export function useAddProjectToRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, projectId }: { roundId: string; projectId: string }) =>
      reviewBoardService.addProject(roundId, projectId),
    onSuccess: () => {
      toast.success(i18n.t("toast.projectAddedToRound"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.projectAddFailed")),
  });
}

export function useRemoveProjectFromRoundMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, projectId }: { roundId: string; projectId: string }) =>
      reviewBoardService.removeProject(roundId, projectId),
    onSuccess: () => {
      toast.success(i18n.t("toast.projectRemovedFromRound"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.projectRemoveFailed")),
  });
}

export function useCreateCouncilPackageMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: CreateCouncilPackagePayload }) =>
      reviewBoardService.createCouncilPackage(roundId, payload),
    onSuccess: () => {
      toast.success(i18n.t("toast.councilCreated"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.councilCreateFailed")),
  });
}

export function useDeleteCouncilMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: (councilId: string) => reviewBoardService.deleteCouncil(councilId),
    onSuccess: () => {
      toast.success(i18n.t("toast.councilDeleted"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.councilDeleteFailed")),
  });
}

export function useAssignProjectToCouncilMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation<
    unknown,
    ApiError,
    { councilId: string; projectId: string; acceptWithoutExpertise?: boolean; expertiseNote?: string }
  >({
    mutationFn: ({ councilId, projectId, acceptWithoutExpertise, expertiseNote }) =>
      reviewBoardService.assignProjectToCouncil(councilId, projectId, acceptWithoutExpertise, expertiseNote),
    onSuccess: () => {
      toast.success(i18n.t("toast.projectAssigned"));
      invalidate();
    },
    // Không tự bắn toast ở đây — thông báo "khác lĩnh vực" cần mở hộp thoại xin lý do ngay tại chỗ
    // (CouncilAssignSelect) thay vì chỉ hiện chữ rồi hết, nên để component gọi tự quyết định.
  });
}

export function useRemoveProjectFromCouncilMutation(cycleId?: number, trackId?: number) {
  const invalidate = useInvalidateBoard(cycleId, trackId);
  return useMutation({
    mutationFn: ({ councilId, projectId }: { councilId: string; projectId: string }) =>
      reviewBoardService.removeProjectFromCouncil(councilId, projectId),
    onSuccess: () => {
      toast.success(i18n.t("toast.projectUnassigned"));
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.projectRemoveFailed")),
  });
}
