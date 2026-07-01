import type { LucideIcon } from "lucide-react";
import type { Role } from "@/constants/roles";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}
