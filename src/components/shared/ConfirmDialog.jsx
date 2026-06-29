import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmDialog — Modal confirmation dialog for destructive actions.
 * 
 * Uses native <dialog> element for proper focus trapping and accessibility.
 * Renders a red/orange warning for dangerous operations like soft delete.
 *
 * @param {boolean} open - Whether the dialog is visible
 * @param {() => void} onClose - Callback to close the dialog
 * @param {() => void} onConfirm - Callback when user confirms the action
 * @param {string} title - Dialog title
 * @param {string} description - Warning message
 * @param {string} [confirmLabel="Xác nhận"] - Confirm button text
 * @param {string} [cancelLabel="Hủy"] - Cancel button text
 * @param {"danger" | "warning"} [variant="danger"] - Visual style
 * @param {boolean} [isLoading=false] - Show loading state on confirm button
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  isLoading = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Close on Escape
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const isDanger = variant === "danger";

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 m-0 max-h-dvh max-w-lg w-full p-0 bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 p-6">
          {/* Close button */}
          <div className="flex justify-end -mt-2 -mr-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          {/* Icon + Content */}
          <div className="flex flex-col items-center text-center gap-4 mt-1">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isDanger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            }`}>
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
                {title}
              </h2>
              {description && (
                <p id="confirm-dialog-desc" className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              className={`flex-1 ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
