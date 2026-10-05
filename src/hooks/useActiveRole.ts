import { useAuthStore } from "@/store/auth.store";
import { ROLES, type Role } from "@/constants/roles";

/**
 * Gác giao diện theo **vai ĐANG CHỌN** ở dropdown header, không phải danh sách vai người đó *có*.
 *
 * Trước đây điều hướng (sidebar, dashboard) đọc `activeRole` còn nút hành động trong màn hợp đồng
 * lại đọc `user.roles.includes(STAFF)`. Hậu quả với người đa vai (rule #23): chuyển sang vai Giảng
 * viên thì menu đổi sang PI, nhưng mở chi tiết hợp đồng **vẫn thấy nút của Phòng QLKH** — sinh lịch
 * giải ngân, xác nhận đã chi, lập quyết toán. Đang đóng vai này mà bấm được việc của vai kia.
 *
 * Đây là chuyện **nhất quán giao diện**, không phải hàng rào bảo mật: máy chủ vẫn phân quyền theo
 * vai thật trong token, nên người có quyền Staff gọi thẳng API vẫn qua. Hàng rào nằm ở BE.
 */
export function useActiveRole(): Role | null {
  return useAuthStore((state) => state.activeRole);
}

/** Đang làm việc ở vai Phòng QLKH hoặc Quản trị — nơi có các thao tác quản lý. */
export function useIsManaging(): boolean {
  return useAuthStore(
    (state) => state.activeRole === ROLES.ADMIN || state.activeRole === ROLES.STAFF
  );
}

/**
 * Quyền quản trị hệ thống. Dùng `activeRole` để người đa vai không thấy công cụ quản trị khi đang
 * đóng vai khác — nhưng vẫn kiểm `roles` làm điều kiện cần, phòng khi `activeRole` chưa kịp nạp.
 */
export function useIsAdmin(): boolean {
  return useAuthStore(
    (state) => state.activeRole === ROLES.ADMIN && (state.user?.roles.includes(ROLES.ADMIN) ?? false)
  );
}
