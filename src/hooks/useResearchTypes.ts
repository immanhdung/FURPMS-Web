import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { researchTypeService } from "@/services/api/research-type.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateResearchTypePayload, UpdateResearchTypePayload } from "@/types/research-type";

export function useResearchTypesQuery(includeInactive = false) {
  return useQuery({
    queryKey: [...queryKeys.researchTypes.list(), includeInactive],
    queryFn: () => researchTypeService.list(includeInactive),
  });
}

export function useCreateResearchTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateResearchTypePayload) => researchTypeService.create(payload),
    onSuccess: () => {
      toast.success("Research type created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.researchTypes.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create research type."),
  });
}

export function useUpdateResearchTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateResearchTypePayload }) =>
      researchTypeService.update(id, payload),
    onSuccess: () => {
      toast.success("Research type updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.researchTypes.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update research type."),
  });
}

export function useDeleteResearchTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => researchTypeService.remove(id),
    onSuccess: () => {
      toast.success("Research type deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.researchTypes.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to delete research type."),
  });
}
