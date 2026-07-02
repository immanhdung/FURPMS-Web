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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignTrackOwnerMutation } from "@/hooks/useTracks";
import { useUsersQuery } from "@/hooks/useUsers";
import type { Track } from "@/types/track";

interface AssignTrackOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
}

export function AssignTrackOwnerDialog({ open, onOpenChange, track }: AssignTrackOwnerDialogProps) {
  const { data: users } = useUsersQuery();
  const assignMutation = useAssignTrackOwnerMutation();
  const [ownerId, setOwnerId] = useState<string | undefined>(track?.ownerId ?? undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign field owner</DialogTitle>
          <DialogDescription>Choose the staff member responsible for "{track?.name}".</DialogDescription>
        </DialogHeader>

        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select owner" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={assignMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!ownerId || assignMutation.isPending}
            onClick={() =>
              track &&
              ownerId &&
              assignMutation.mutate({ id: track.id, ownerId }, { onSuccess: () => onOpenChange(false) })
            }
          >
            {assignMutation.isPending && <Loader2 className="animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
