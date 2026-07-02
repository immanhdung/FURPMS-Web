import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cycleService } from "@/services/api/cycle.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CyclePayload } from "@/types/cycle";

export function useCyclesQuery() {
  return useQuery({
    queryKey: queryKeys.cycles.list(),
    queryFn: cycleService.list,
  });
}

export function useCycleQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.cycles.detail(String(id ?? "")),
    queryFn: () => cycleService.getById(id as number),
    enabled: id !== null,
  });
}

export function useCreateCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CyclePayload) => cycleService.create(payload),
    onSuccess: () => {
      toast.success("Research cycle created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.cycles.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create cycle."),
  });
}

export function useUpdateCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CyclePayload }) => cycleService.update(id, payload),
    onSuccess: () => {
      toast.success("Research cycle updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.cycles.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update cycle."),
  });
}

export function useOpenCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cycleService.open(id),
    onSuccess: () => {
      toast.success("Cycle opened for submissions.");
      queryClient.invalidateQueries({ queryKey: queryKeys.cycles.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to open cycle."),
  });
}

export function useCloseCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cycleService.close(id),
    onSuccess: () => {
      toast.success("Cycle closed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.cycles.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to close cycle."),
  });
}
