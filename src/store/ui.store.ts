import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  // Demo aid: show a "fill with sample data" button on the proposal form. Off in production
  // builds by default; toggle it from Settings without touching code.
  sampleFillEnabled: boolean;
  // Demo aid riêng cho màn chấm: không dùng chung với form đề cương để có thể tắt nút
  // chấm nhanh mà vẫn giữ dữ liệu mẫu của wizard (và ngược lại).
  quickScoreFillEnabled: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSampleFillEnabled: (enabled: boolean) => void;
  setQuickScoreFillEnabled: (enabled: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      /**
       * Mặc định SÁNG, không theo hệ thống (thầy 05/08: "để default mặc định màu trắng").
       * Máy chấm để dark mode thì "system" làm cả hệ thống hiện tối — ảnh chụp tài liệu và
       * biểu đồ đều lệch màu so với bản in.
       */
      theme: "light",
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      sampleFillEnabled: import.meta.env.DEV,
      quickScoreFillEnabled: import.meta.env.DEV,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setSampleFillEnabled: (enabled) => set({ sampleFillEnabled: enabled }),
      setQuickScoreFillEnabled: (enabled) => set({ quickScoreFillEnabled: enabled }),
    }),
    {
      name: "furpms-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sampleFillEnabled: state.sampleFillEnabled,
        quickScoreFillEnabled: state.quickScoreFillEnabled,
      }),
    }
  )
);

export function resolveEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
