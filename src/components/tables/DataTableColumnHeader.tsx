import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-[11px] font-bold tracking-wide uppercase text-slate-800 dark:text-slate-100", className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2.5 gap-1.5 text-[11px] font-bold tracking-wide uppercase text-slate-800 dark:text-slate-100 transition-colors hover:text-primary dark:hover:text-blue-400 cursor-pointer",
        sorted && "text-primary dark:text-blue-400",
        className
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" && <ArrowUp className="size-3.5 text-primary dark:text-blue-400" />}
      {sorted === "desc" && <ArrowDown className="size-3.5 text-primary dark:text-blue-400" />}
      {!sorted && <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />}
    </Button>
  );
}
