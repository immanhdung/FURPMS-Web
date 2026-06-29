import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

// ─── Query Keys ───────────────────────────────────────────────────────
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  profile: (id) => [...userKeys.detail(id), "profile"],
};

// ─── Queries ─────────────────────────────────────────────────────────

/** Fetch list of users with pagination and filters */
export function useUsers(filters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/users", { params: filters });
      return data; // { success, data, pagination }
    },
    keepPreviousData: true,
  });
}

/** Fetch a single user detail */
export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/** Fetch user scientific profile (BM02) */
export function useUserProfile(id) {
  return useQuery({
    queryKey: userKeys.profile(id),
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}/profile`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────

/** Create a new user (Admin only) */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/users", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/** Update an existing user (Admin only) */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/** Soft delete / deactivate a user (Admin only) */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/** Update user scientific profile */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/users/${id}/profile`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(id) });
    },
  });
}
