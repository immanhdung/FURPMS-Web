import React from "react";

/**
 * Unified StatusBadge component supporting all entity status maps.
 *
 * @param {string} status - The status key (e.g., "DRAFT", "APPROVED")
 * @param {Record<string, {label: string, color: string, icon?: React.ComponentType}>} statusMap - Mapping of status → display config
 */
export function StatusBadge({ status, statusMap }) {
  const info = statusMap?.[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${info.color}`}>
      {Icon && <Icon size={12} aria-hidden="true" />} {info.label}
    </span>
  );
}
