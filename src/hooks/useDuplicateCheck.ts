import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { duplicateCheckService } from "@/services/api/duplicate-check.service";
import { queryKeys } from "@/services/queryKeys";
import type { ReviewDuplicatePayload } from "@/types/duplicate-check";

export function useDuplicateCheckQuery(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.duplicateCheck.detail(proposalId ?? ""),
    queryFn: () => duplicateCheckService.get(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

/**
 * Cờ trùng lặp cho cả một trang danh sách — gọi MỘT lần cho toàn bộ id đang hiện, không phải một
 * lần cho mỗi dòng. `enabled` mặc định false vì chỉ Staff/Admin cần, và chỉ khi danh sách đã có.
 */
export function useDuplicateFlagsQuery(proposalIds: string[], enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.duplicateCheck.all(), "flags", proposalIds],
    queryFn: () => duplicateCheckService.flags(proposalIds),
    enabled: enabled && proposalIds.length > 0,
    staleTime: 60_000,
  });
}

export function useExplainDuplicateMutation(proposalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (force: boolean) => duplicateCheckService.explain(proposalId, force),
    onSuccess: (data) => qc.setQueryData(queryKeys.duplicateCheck.detail(proposalId), data),
  });
}

export function useReviewDuplicateMutation(proposalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewDuplicatePayload) =>
      duplicateCheckService.review(proposalId, payload),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.duplicateCheck.detail(proposalId), data);
      // Kết luận sinh một dòng trong sổ quyết định — làm mới để hồ sơ hiện ngay.
      qc.invalidateQueries({ queryKey: queryKeys.projectDecisions.all() });
      toast.success("Đã ghi kết luận rà trùng lặp vào hồ sơ đề tài.");
    },
  });
}
