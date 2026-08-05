import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { SidebarNav } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUiStore } from "@/store/ui.store";

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const { t } = useTranslation();

  return (
    <header className="liquid-glass sticky top-3 z-30 mx-3 mt-3 flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-border px-4 md:mr-3 sm:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open navigation menu" onClick={() => setMobileNavOpen(true)}>
          <Menu />
        </Button>
        <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>

      <Breadcrumb />

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden w-56 justify-start gap-2 rounded-full bg-card/60 text-muted-foreground lg:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="size-3.5" />
          {t("common.search")}
          <kbd className="ml-auto rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full lg:hidden"
          aria-label={t("common.search")}
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search />
        </Button>

        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
