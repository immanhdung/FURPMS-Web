import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

async function prepareMocking() {
  if (!import.meta.env.DEV) return;
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
