import { useEffect, type ReactNode } from "react";
import { resolveEffectiveTheme, useUiStore } from "@/store/ui.store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const effective = resolveEffectiveTheme(theme);
      root.classList.toggle("dark", effective === "dark");
    };

    applyTheme();

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  return children;
}
