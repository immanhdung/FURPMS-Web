import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api/axios";
import { toast } from "sonner";

// ─── Query Keys ───────────────────────────────────────────────────────
export const councilKeys = {
  all: ["councils"],
  rounds: (proposalId) => [...councilKeys.all, "rounds", proposalId],
  myCouncils: () => [...councilKeys.all, "my"],
  detail: (id) => [...councilKeys.all, "detail", id],
  members: (id) => [...councilKeys.all, "members", id],
  rubrics: ["rubrics"],
  rubricDetail: (id) => ["rubrics", id],
  scores: (id) => [...councilKeys.all, "scores", id],
  myScore: (id) => [...councilKeys.all, "myScore", id],
  decision: (id) => [...councilKeys.all, "decision", id],
};

// ─── Review Rounds ──────────────────────────────────────────────────
export function useRounds(proposalId) {
  return useQuery({
    queryKey: councilKeys.rounds(proposalId),
    queryFn: async () => {
      const { data } = await api.get(`/proposals/${proposalId}/rounds`);
      return data.data || [];
    },
    enabled: !!proposalId,
  });
}

export function useCreateRound(proposalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/proposals/${proposalId}/rounds`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.rounds(proposalId) });
      toast.success("Tạo vòng xét duyệt thành công");
    },
    onError: () => toast.error("Có lỗi xảy ra khi tạo vòng xét duyệt"),
  });
}

export function useOpenRound(proposalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roundId) => {
      const { data } = await api.post(`/rounds/${roundId}/open`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.rounds(proposalId) });
      toast.success("Đã mở vòng xét duyệt");
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toast.error("Không thể mở vòng này do vòng tiên quyết chưa Đạt (PASSED).", {
          style: { background: "#FEF3C7", color: "#92400E", borderColor: "#F59E0B" }
        });
      } else {
        toast.error("Có lỗi xảy ra khi mở vòng");
      }
    }
  });
}

export function useCloseRound(proposalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roundId, payload }) => {
      const { data } = await api.post(`/rounds/${roundId}/close`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.rounds(proposalId) });
      toast.success("Đã chốt kết quả vòng xét duyệt");
    },
    onError: () => toast.error("Có lỗi xảy ra khi chốt vòng"),
  });
}

// ─── Councils ───────────────────────────────────────────────────────
export function useMyCouncils() {
  return useQuery({
    queryKey: councilKeys.myCouncils(),
    queryFn: async () => {
      const { data } = await api.get("/councils/my-memberships");
      return data.data || [];
    },
    placeholderData: keepPreviousData,
  });
}

export function useCouncil(id) {
  return useQuery({
    queryKey: councilKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/councils/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCouncil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/councils", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.all });
      toast.success("Thành lập hội đồng thành công");
    },
    onError: () => toast.error("Lỗi khi thành lập hội đồng"),
  });
}

export function useUpdateCouncilStatus(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status) => {
      const { data } = await api.patch(`/councils/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: councilKeys.myCouncils() });
      toast.success("Cập nhật trạng thái hội đồng thành công");
    },
    onError: () => toast.error("Lỗi khi cập nhật trạng thái"),
  });
}

// ─── Council Members ────────────────────────────────────────────────
export function useCouncilMembers(id) {
  return useQuery({
    queryKey: councilKeys.members(id),
    queryFn: async () => {
      const { data } = await api.get(`/councils/${id}/members`);
      return data.data || [];
    },
    enabled: !!id,
  });
}

export function useAddCouncilMember(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/councils/${id}/members`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.members(id) });
      queryClient.invalidateQueries({ queryKey: councilKeys.detail(id) });
      toast.success("Đã thêm thành viên vào hội đồng");
    },
    onError: () => toast.error("Lỗi khi thêm thành viên"),
  });
}

export function useInviteByEmail(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/councils/${id}/members/invite-by-email`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.members(id) });
      queryClient.invalidateQueries({ queryKey: councilKeys.detail(id) });
      toast.success("Đã gửi email mời chuyên gia");
    },
    onError: () => toast.error("Lỗi khi mời chuyên gia"),
  });
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, response, declineReason }) => {
      const { data } = await api.patch(`/council-members/${memberId}/respond`, { response, declineReason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.all });
      toast.success("Đã phản hồi lời mời");
    },
    onError: () => toast.error("Lỗi khi phản hồi lời mời"),
  });
}

export function useRemoveCouncilMember(councilId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId) => {
      const { data } = await api.delete(`/council-members/${memberId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.members(councilId) });
      queryClient.invalidateQueries({ queryKey: councilKeys.detail(councilId) });
      toast.success("Đã xóa thành viên khỏi hội đồng");
    },
    onError: () => toast.error("Lỗi khi xóa thành viên"),
  });
}

// ─── Scoring ────────────────────────────────────────────────────────
export function useRubrics() {
  return useQuery({
    queryKey: councilKeys.rubrics,
    queryFn: async () => {
      const { data } = await api.get("/review-scoring/rubrics");
      return data.data || [];
    },
  });
}

export function useRubric(id) {
  return useQuery({
    queryKey: councilKeys.rubricDetail(id),
    queryFn: async () => {
      const { data } = await api.get(`/review-scoring/rubrics/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useMyScore(councilId) {
  return useQuery({
    queryKey: councilKeys.myScore(councilId),
    queryFn: async () => {
      const { data } = await api.get(`/review-scoring/councils/${councilId}/scores/my`);
      return data.data; // Can be null if not scored yet
    },
    enabled: !!councilId,
  });
}

export function useAllScores(councilId) {
  return useQuery({
    queryKey: councilKeys.scores(councilId),
    queryFn: async () => {
      const { data } = await api.get(`/review-scoring/councils/${councilId}/scores`);
      return data.data || [];
    },
    enabled: !!councilId,
  });
}

export function useSubmitScore(councilId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/review-scoring/councils/${councilId}/scores`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.scores(councilId) });
      queryClient.invalidateQueries({ queryKey: councilKeys.myScore(councilId) });
      toast.success("Nộp phiếu điểm thành công!");
    },
    onError: () => toast.error("Có lỗi xảy ra khi nộp điểm"),
  });
}

export function useFinalizeDecision(councilId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/review-scoring/councils/${councilId}/decision`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: councilKeys.detail(councilId) });
      queryClient.invalidateQueries({ queryKey: councilKeys.decision(councilId) });
      queryClient.invalidateQueries({ queryKey: councilKeys.myCouncils() });
      toast.success("Chốt quyết định hội đồng thành công");
    },
    onError: () => toast.error("Lỗi khi chốt quyết định"),
  });
}

export function useDecision(councilId) {
  return useQuery({
    queryKey: councilKeys.decision(councilId),
    queryFn: async () => {
      const { data } = await api.get(`/review-scoring/councils/${councilId}/decision`);
      return data.data; // Can be null
    },
    enabled: !!councilId,
  });
}
