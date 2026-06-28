import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination component matching API envelope pagination object.
 *
 * @param {{page: number, limit: number, total: number, totalPages: number}} pagination
 * @param {(page: number) => void} onPageChange
 */
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, total, totalPages } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border bg-surface/50">
      <span className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        Hiển thị {start}–{end} / {total} kết quả
      </span>
      <nav className="flex gap-2" aria-label="Phân trang">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
}
