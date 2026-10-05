import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/constants/roles";

interface RoleGuardProps {
  allowedRoles: Role[];
}

/**
 * Chặn theo **vai đang chọn** ở dropdown header, không phải theo toàn bộ vai người đó có.
 *
 * Menu bên trái vốn đã lọc theo `activeRole`, nhưng guard thì trước đây soi `user.roles` — nên một
 * người vừa là Phòng QLKH vừa là Giảng viên, khi đã chuyển sang vai Giảng viên, gõ thẳng
 * `/contracts` là vẫn vào được: thấy hợp đồng của mọi chủ nhiệm và còn nguyên nút "Tạo hợp đồng".
 * Đổi vai mà màn hình không đổi theo thì việc đổi vai chẳng để làm gì (rule #23).
 *
 * Đây là ranh giới **hiển thị**, không phải bảo mật — máy chủ vẫn cấp quyền theo vai thật, đúng như
 * vậy. Muốn xem lại thì bấm đổi vai, không phải đăng nhập lại.
 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  if (!user) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;

  // Chưa chọn vai (người dùng một vai) thì xét toàn bộ vai như cũ.
  const effectiveRoles = activeRole && user.roles.includes(activeRole) ? [activeRole] : user.roles;

  if (!effectiveRoles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
