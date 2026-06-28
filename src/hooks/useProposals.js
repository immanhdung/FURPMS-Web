import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

// ─── Query Keys ───────────────────────────────────────────────────────
export const proposalKeys = {
  all: ["proposals"],
  lists: () => [...proposalKeys.all, "list"],
  list: (filters) => [...proposalKeys.lists(), { filters }],
  details: () => [...proposalKeys.all, "detail"],
  detail: (id) => [...proposalKeys.details(), id],
  team: (id) => [...proposalKeys.detail(id), "team"],
  budget: (id) => [...proposalKeys.detail(id), "budget"],
  documents: (id) => [...proposalKeys.detail(id), "documents"],
};

// ─── Queries ─────────────────────────────────────────────────────────

/** Fetch list of proposals with pagination and filters */
export function useProposals(filters) {
  return useQuery({
    queryKey: proposalKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/proposals", { params: filters });
      return data; // Returns { success, data, pagination }
    },
    keepPreviousData: true,
  });
}

/** Fetch a single proposal details */
export function useProposal(id) {
  return useQuery({
    queryKey: proposalKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/proposals/${id}`);
      return data.data; // Returns Proposal object
    },
    enabled: !!id,
  });
}

// ─── Mutations: Core ─────────────────────────────────────────────────

/** Create a new draft proposal (Step 1) */
export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/proposals", payload);
      return data.data;
    },
    onSuccess: (newProposal) => {
      queryClient.setQueryData(proposalKeys.detail(newProposal.id), newProposal);
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}

/** Update an existing draft proposal (Step 1) */
export function useUpdateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/proposals/${id}`, payload);
      return data.data;
    },
    onSuccess: (updatedProposal, { id }) => {
      queryClient.setQueryData(proposalKeys.detail(id), updatedProposal);
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}

/** Submit a draft proposal (Step 5) */
export function useSubmitProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/proposals/${id}/submit`);
      return data.data;
    },
    onSuccess: (updatedProposal, id) => {
      queryClient.setQueryData(proposalKeys.detail(id), updatedProposal);
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}

// ─── Mutations: Team (Step 2) ────────────────────────────────────────

export function useManageTeamMembers() {
  const queryClient = useQueryClient();
  
  const addMember = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.post(`/proposals/${id}/team-members`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, memberId, payload }) => {
      const { data } = await api.put(`/proposals/${id}/team-members/${memberId}`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ id, memberId }) => {
      await api.delete(`/proposals/${id}/team-members/${memberId}`);
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  return { addMember, updateMember, removeMember };
}

// ─── Mutations: Budget (Step 3) ──────────────────────────────────────

export function useManageBudget() {
  const queryClient = useQueryClient();

  const updateItems = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/proposals/${id}/budget/items`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  const updateLabor = useMutation({
    mutationFn: async ({ id, memberId, payload }) => {
      const { data } = await api.put(`/proposals/${id}/budget/labor/${memberId}`, payload);
      return data.data;
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  return { updateItems, updateLabor };
}

// ─── Mutations: Documents (Step 4) ───────────────────────────────────

export function useManageDocuments() {
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async ({ id, formData }) => {
      // Must use multipart/form-data for document upload (API Contract §10)
      const { data } = await api.post(`/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  const remove = useMutation({
    mutationFn: async ({ id, docId }) => {
      await api.delete(`/documents/${docId}`);
    },
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) }),
  });

  return { upload, remove };
}

// ─── AI Features ─────────────────────────────────────────────────────

export function useGenerateAISummary() {
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/ai/proposals/${id}/generate-summary`);
      return data.data; // { summary: string }
    },
  });
}
