import React from "react";
import { Filter } from "lucide-react";

/**
 * Reusable filter pills component with proper aria-pressed toggle semantics
 * and focus-visible rings for keyboard accessibility.
 *
 * @param {Array<{key: string, label: string}>} options - The filter options
 * @param {string} value - Currently active filter key
 * @param {(key: string) => void} onChange - Callback when filter changes
 * @param {boolean} [showIcon=true] - Whether to show the Filter icon
 */
export function FilterPills({ options, value, onChange, showIcon = true }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Bộ lọc trạng thái">
      {showIcon && <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />}
      {options.map((opt) => {
        const itemKey = opt.key ?? opt.id ?? opt.value;
        return (
          <button
            key={itemKey}
            onClick={() => onChange(itemKey)}
            aria-pressed={value === itemKey}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              value === itemKey
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
