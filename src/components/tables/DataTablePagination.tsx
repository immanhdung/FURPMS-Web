import type { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();
  const { pageIndex, pageSize } = table.getState().pagination;
  const rowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-1 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {t("common.showing", {
          from: rowCount === 0 ? 0 : pageIndex * pageSize + 1,
          to: Math.min((pageIndex + 1) * pageSize, rowCount),
          total: rowCount,
        })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.firstPage")}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.prevPage")}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft />
        </Button>
        <span className="px-2 text-sm text-muted-foreground">
          {t("common.pageOf", { page: table.getPageCount() === 0 ? 0 : pageIndex + 1, total: table.getPageCount() })}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.nextPage")}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.lastPage")}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
