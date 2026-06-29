import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api/axios";

// ─── Query Keys ───────────────────────────────────────────────────────
export const cycleKeys = {
  all: ["cycles"],
  lists: () => [...cycleKeys.all, "list"],
  list: (filters) => [...cycleKeys.lists(), { filters }],
  details: () => [...cycleKeys.all, "detail"],
  detail: (id) => [...cycleKeys.details(), id],
  tracks: () => ["tracks"],
};

// ─── Queries ─────────────────────────────────────────────────────────

export function useCycles(filters) {
  return useQuery({
    queryKey: cycleKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/cycles", { params: filters });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCycle(id) {
  return useQuery({
    queryKey: cycleKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/cycles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useTracks() {
  return useQuery({
    queryKey: cycleKeys.tracks(),
    queryFn: async () => {
      const { data } = await api.get("/cycles/tracks");
      return data.data;
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/cycles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.lists() });
    },
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/cycles/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cycleKeys.lists() });
    },
  });
}

// ─── State Transitions ───────────────────────────────────────────────

export function useOpenCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/cycles/${id}/open`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.all });
    },
  });
}

export function useStartReviewCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/cycles/${id}/start-review`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.all });
    },
  });
}

export function useCloseCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/cycles/${id}/close`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.all });
    },
  });
}

export function useArchiveCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/cycles/${id}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.all });
    },
  });
}
