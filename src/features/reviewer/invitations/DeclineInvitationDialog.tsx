import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useRespondToInvitationMutation } from "@/hooks/useMemberships";

interface DeclineInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
}

export function DeclineInvitationDialog({ open, onOpenChange, memberId }: DeclineInvitationDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const respondMutation = useRespondToInvitationMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reviewer.declineTitle")}</DialogTitle>
          <DialogDescription>{t("reviewer.declineDesc")}</DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder={t("reviewer.declineReasonPlaceholder")}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={respondMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={respondMutation.isPending}
            onClick={() =>
              memberId &&
              respondMutation.mutate(
                { memberId, payload: { accept: false, declineReason: reason || undefined } },
                {
                  onSuccess: () => {
                    setReason("");
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {respondMutation.isPending && <Loader2 className="animate-spin" />}
            {t("reviewer.declineBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
