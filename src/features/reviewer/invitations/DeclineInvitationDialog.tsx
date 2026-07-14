import { useState } from "react";
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
  const [reason, setReason] = useState("");
  const respondMutation = useRespondToInvitationMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline invitation</DialogTitle>
          <DialogDescription>Let the staff know why you can't join this council (optional).</DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="Reason for declining..."
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={respondMutation.isPending}>
            Cancel
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
            Decline invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
