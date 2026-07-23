import { Check, KeyRound, LogOut, Settings, User as UserIcon, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ROLE_PRIORITY, type Role } from "@/constants/roles";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) return null;

  // Roles the user actually holds, in a stable priority order (never the full 4-role taxonomy).
  const myRoles = ROLE_PRIORITY.filter((role) => user.roles.includes(role));
  const roleName = (role: Role) => t(`roleName.${role}`);

  const switchRole = (role: Role) => {
    if (role === activeRole) return;
    setActiveRole(role);
    navigate(ROUTES.DASHBOARD); // land on the chosen role's home so the nav matches
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
          <Avatar size="sm">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
            <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium text-foreground sm:inline">
            {user.fullName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {myRoles.length > 1 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <UserCog className="size-3.5" />
              {t("header.viewingAs")}
            </DropdownMenuLabel>
            {myRoles.map((role) => (
              <DropdownMenuItem key={role} onSelect={() => switchRole(role)}>
                <Check className={cn("size-4", role === activeRole ? "opacity-100" : "opacity-0")} />
                {roleName(role)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => navigate(ROUTES.PROFILE)}>
          <UserIcon />
          {t("header.profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(ROUTES.CHANGE_PASSWORD)}>
          <KeyRound />
          {t("auth.changePassword")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(ROUTES.SETTINGS)}>
          <Settings />
          {t("nav.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={logout}>
          <LogOut />
          {t("header.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
