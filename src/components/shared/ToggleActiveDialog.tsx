import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface ToggleActiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: boolean;
  entityName: string;
  itemLabel: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

/** Reusable "deactivate/activate this record" confirmation, used by entities with a soft isActive flag instead of hard delete. */
export function ToggleActiveDialog({
  open,
  onOpenChange,
  isActive,
  entityName,
  itemLabel,
  isLoading,
  onConfirm,
}: ToggleActiveDialogProps) {
  const { t } = useTranslation();
  const action = isActive ? t("common.deactivate") : t("common.activate");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("common.toggleTitle", { action, entity: entityName })}
      description={t("common.toggleConfirm", { action: action.toLowerCase(), item: itemLabel })}
      variant={isActive ? "destructive" : "default"}
      confirmLabel={action}
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
}
