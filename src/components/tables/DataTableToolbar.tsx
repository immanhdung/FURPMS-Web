import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Table } from "@tanstack/react-table";
import { Download, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { exportRowsToCsv } from "@/utils/exportCsv";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  exportFileName?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  exportFileName = "export",
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState((table.getState().globalFilter as string) ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    table.setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, table]);

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original as Record<string, unknown>);
    exportRowsToCsv(rows, exportFileName);
  };

  return (
    <div className="flex items-center justify-between gap-2 pb-3">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder ?? t("common.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 max-w-xs"
        />
        {searchInput.length > 0 && (
          <Button variant="ghost" size="icon-sm" aria-label={t("common.clearSearch")} onClick={() => setSearchInput("")}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download />
          {t("common.export")}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal />
              {t("common.columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t("common.toggleColumns")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                  onSelect={(e) => e.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
