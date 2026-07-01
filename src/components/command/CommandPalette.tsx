import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LayoutDashboard, LogOut, Moon, Sun, User as UserIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { getNavItemsForRoles } from "@/constants/nav";
import { useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export function CommandPalette() {
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const setTheme = useUiStore((state) => state.setTheme);
  const theme = useUiStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useLogout();

  const navItems = useMemo(() => (user ? getNavItemsForRoles(user.roles) : []), [user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {navItems.map((item) => (
            <CommandItem key={item.path} onSelect={() => runCommand(() => navigate(item.path))}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? <Sun /> : <Moon />}
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.DASHBOARD))}>
            <LayoutDashboard />
            Go to dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.PROFILE))}>
            <UserIcon />
            View profile
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.CHANGE_PASSWORD))}>
            <KeyRound />
            Change password
          </CommandItem>
          <CommandItem onSelect={() => runCommand(logout)}>
            <LogOut />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
