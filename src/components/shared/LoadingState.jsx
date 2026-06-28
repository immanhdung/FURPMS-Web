import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable loading spinner with aria-live for accessibility.
 */
export function LoadingState({ message = "Đang tải…" }) {
  return (
    <div
      className="flex items-center justify-center py-12 sm:py-16 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none mr-2" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
