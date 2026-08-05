import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { academicProfileService } from "@/services/api/academic-profile.service";
import type { ApiError } from "@/types/common";
import type { AcademicProfilePayload } from "@/types/academic-profile";

export const academicProfileKeys = {
  all: ["academic-profile"] as const,
  byUser: (userId: string) => ["academic-profile", userId] as const,
};

export function useAcademicProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: academicProfileKeys.byUser(userId ?? ""),
    queryFn: () => academicProfileService.getByUserId(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpsertAcademicProfileMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcademicProfilePayload) =>
      academicProfileService.upsert(userId, payload),
    onSuccess: () => {
      toast.success("Academic profile saved.");
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.byUser(userId) });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to save academic profile.");
    },
  });
}
