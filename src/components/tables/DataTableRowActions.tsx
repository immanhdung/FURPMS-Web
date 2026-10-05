import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  variant?: "default" | "destructive";
}

interface DataTableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  extraActions?: RowAction[];
}

export function DataTableRowActions({
  onView,
  onEdit,
  onDelete,
  deleteLabel,
  extraActions = [],
}: DataTableRowActionsProps) {
  const { t } = useTranslation();
  if (!onView && !onEdit && !onDelete && extraActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
          <span className="sr-only">{t("common.actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onView && (
          <DropdownMenuItem onSelect={onView}>
            <Eye />
            {t("common.view")}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil />
            {t("common.edit")}
          </DropdownMenuItem>
        )}
        {extraActions.map((action) => (
          <DropdownMenuItem key={action.label} variant={action.variant} onSelect={action.onSelect}>
            <action.icon />
            {action.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <>
            {(onView || onEdit || extraActions.length > 0) && <DropdownMenuSeparator />}
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 />
              {deleteLabel ?? t("common.delete")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
