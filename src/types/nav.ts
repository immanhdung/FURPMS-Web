import type { LucideIcon } from "lucide-react";
import type { Role } from "@/constants/roles";

export interface NavItem {
  /** Khóa i18n để dịch nhãn (vd "nav.dashboard"). */
  labelKey: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}
