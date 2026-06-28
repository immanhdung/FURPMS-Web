import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Reusable empty state component with icon, message, and optional action.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Không có dữ liệu",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
