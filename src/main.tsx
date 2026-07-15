import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

async function prepareMocking() {
  // Mock chỉ bật khi DEV **và** VITE_USE_MOCK_API=true (trước đây cờ này bị bỏ qua —
  // dev luôn chạy mock nên không test được BE thật).
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API !== "true") return;
  const { worker } = await import("@/mock/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

prepareMocking().then(() => {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
