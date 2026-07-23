import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitDeliverableMutation } from "@/hooks/useDeliverables";
import type { Deliverable } from "@/types/deliverable";

interface SubmitDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  deliverable: Deliverable | null;
}

export function SubmitDeliverableDialog({
  open,
  onOpenChange,
  contractId,
  deliverable,
}: SubmitDeliverableDialogProps) {
  const { t } = useTranslation();
  const submitMutation = useSubmitDeliverableMutation(contractId);
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open && deliverable) {
      setFileUrl(deliverable.fileUrl ?? "");
      setDescription(deliverable.description ?? "");
    }
  }, [open, deliverable]);

  const canSubmit = fileUrl.trim().length > 0 && !submitMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.deliverable.submitTitle")}</DialogTitle>
          <DialogDescription>{deliverable?.productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label htmlFor="deliverable-url" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.deliverable.fileLink")} <span className="text-destructive">*</span>
            </label>
            <Input
              id="deliverable-url"
              placeholder={t("contract.deliverable.fileLinkPlaceholder")}
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="deliverable-desc" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.disbursement.notes")}
            </label>
            <Textarea
              id="deliverable-desc"
              rows={3}
              placeholder={t("contract.deliverable.notesPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              deliverable &&
              submitMutation.mutate(
                { id: deliverable.id, payload: { fileUrl: fileUrl.trim(), description: description.trim() || undefined } },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {submitMutation.isPending && <Loader2 className="animate-spin" />}
            {t("contract.deliverable.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
