import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationalUnitService } from "@/services/api/organizational-unit.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { OrgUnitPayload } from "@/types/organizational-unit";

export function useOrganizationalUnitsQuery() {
  return useQuery({
    queryKey: queryKeys.organizationalUnits.list(),
    queryFn: organizationalUnitService.list,
  });
}

export function useCreateOrganizationalUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrgUnitPayload) => organizationalUnitService.create(payload),
    onSuccess: () => {
      toast.success("Organizational unit created.");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationalUnits.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to create organizational unit."),
  });
}

export function useUpdateOrganizationalUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OrgUnitPayload }) =>
      organizationalUnitService.update(id, payload),
    onSuccess: () => {
      toast.success("Organizational unit updated.");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationalUnits.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to update organizational unit."),
  });
}
