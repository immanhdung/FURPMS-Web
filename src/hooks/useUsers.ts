import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { userService } from "@/services/api/user.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user";

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: userService.list,
  });
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => userService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      toast.success("User created successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Unable to create user.");
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Unable to update user.");
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      toast.success(i18n.t("users.deleted"));
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    // BE trả lý do CỤ THỂ khi chặn ("đang là chủ nhiệm đề tài…", "đang là ủy viên hội đồng…") kèm
    // hướng xử lý. Nuốt nó rồi in câu chung chung là Admin không biết phải làm gì tiếp.
    onError: (error: ApiError) => toast.error(error.message || i18n.t("users.deleteFailed")),
  });
}

export function useToggleUserActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.toggleActive(id),
    onSuccess: (user) => {
      toast.success(user?.isActive === false ? i18n.t("users.locked_toast") : i18n.t("users.unlocked_toast"));
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("users.toggleFailed")),
  });
}
