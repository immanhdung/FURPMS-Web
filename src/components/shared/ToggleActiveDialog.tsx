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
  const action = isActive ? "Deactivate" : "Activate";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action} ${entityName}`}
      description={`Are you sure you want to ${action.toLowerCase()} "${itemLabel}"?`}
      variant={isActive ? "destructive" : "default"}
      confirmLabel={action}
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
}
