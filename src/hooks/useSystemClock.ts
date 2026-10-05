import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/api/admin.service";
import { queryKeys } from "@/services/queryKeys";
import { useIsAdmin } from "@/hooks/useActiveRole";
import type { SystemClockState } from "@/types/admin";

export function useSystemClockQuery() {
  const isAdmin = useIsAdmin();

  return useQuery({
    queryKey: queryKeys.systemClock.detail(),
    queryFn: adminService.getSystemClock,
    enabled: isAdmin,
    staleTime: 10 * 1000,
  });
}

export function useAdjustSystemClockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (days: number) => {
      const current = queryClient.getQueryData<SystemClockState>(queryKeys.systemClock.detail());
      const nextOffset = (current?.offsetDays ?? 0) + days;
      await adminService.setSystemClock(nextOffset);
      await adminService.runDeadlineScan();
      return nextOffset;
    },
    onSuccess: (nextOffset, days) => {
      queryClient.setQueryData<SystemClockState>(queryKeys.systemClock.detail(), { offsetDays: nextOffset });
      toast.success(`Advanced the system clock by +${days} day${days === 1 ? "" : "s"}.`);
    },
    onError: () => toast.error("Unable to adjust the system clock."),
  });
}

export function useResetSystemClockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await adminService.setSystemClock(0);
      await adminService.runDeadlineScan();
    },
    onSuccess: () => {
      queryClient.setQueryData<SystemClockState>(queryKeys.systemClock.detail(), { offsetDays: 0 });
      toast.success("System clock reset to real time.");
    },
    onError: () => toast.error("Unable to reset the system clock."),
  });
}
