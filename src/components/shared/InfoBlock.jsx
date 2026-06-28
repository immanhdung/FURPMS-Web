import React from "react";

/**
 * Reusable labeled info block for detail views.
 * Renders label in uppercase muted style, with value or children below.
 */
export function InfoBlock({ label, value, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-foreground whitespace-pre-line">{children || value || "—"}</dd>
    </div>
  );
}
