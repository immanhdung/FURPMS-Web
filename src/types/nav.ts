import type { LucideIcon } from "lucide-react";
import type { Role } from "@/constants/roles";

export interface NavItem {
  /** Khoá i18n để dịch nhãn (vd "nav.dashboard"). */
  labelKey: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
  /** Giữ route và phân quyền nhưng không bày thêm một mục trùng chức năng trên sidebar. */
  hidden?: boolean;
}
