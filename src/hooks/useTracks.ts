import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trackService } from "@/services/api/track.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateTrackPayload, UpdateTrackPayload } from "@/types/track";

export function useTracksQuery() {
  return useQuery({
    queryKey: queryKeys.tracks.list(),
    queryFn: trackService.list,
  });
}

/** Fields attached to a specific cycle. Disabled until a cycle is chosen. */
export function useTracksByCycleQuery(cycleId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.tracks.byCycle(cycleId ?? 0),
    queryFn: () => trackService.listByCycle(cycleId as number),
    enabled: Boolean(cycleId),
  });
}

export function useCreateTrackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTrackPayload) => trackService.create(payload),
    onSuccess: () => {
      toast.success("Research field created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create research field."),
  });
}

export function useUpdateTrackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTrackPayload }) => trackService.update(id, payload),
    onSuccess: () => {
      toast.success("Research field updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update research field."),
  });
}

export function useAssignTrackOwnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ownerId }: { id: number; ownerId: string }) => trackService.assignOwner(id, ownerId),
    onSuccess: () => {
      toast.success("Owner assigned.");
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to assign owner."),
  });
}

export function useDeactivateTrackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trackService.deactivate(id),
    onSuccess: () => {
      toast.success("Research field deactivated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to deactivate research field."),
  });
}
