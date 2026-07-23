import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/app/providers/queryClient";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { onUnauthorized } from "@/services/api/axiosClient";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    onUnauthorized(() => {
      useAuthStore.getState().logout();
      queryClient.clear();
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.assign(ROUTES.LOGIN);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
