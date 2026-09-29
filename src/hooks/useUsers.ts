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
    onSuccess: (_user, payload) => {
      toast.success(i18n.t("users.created", { email: payload.email }));
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    onError: (error: ApiError) => {
      // status 0 = trình duyệt hết 15 giây chờ, KHÔNG có nghĩa máy chủ thất bại: tài khoản được ghi
      // DB trước rồi mới gửi thư chào mừng. Báo "không kết nối được" ở đây khiến admin bấm lại và
      // ăn ngay "Đã có tài khoản dùng email…" (gặp thật 29/09). Nói thẳng là có thể đã tạo, và
      // tải lại danh sách để admin nhìn thấy.
      if (error.status === 0) {
        toast.warning(i18n.t("users.createMaybeDone"), { duration: 10_000 });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        return;
      }
      toast.error(error.message || i18n.t("users.createFailed"));
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: () => {
      toast.success(i18n.t("users.updated"));
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || i18n.t("users.updateFailed"));
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
