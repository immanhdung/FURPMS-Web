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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCouncilMemberMutation } from "@/hooks/useCouncilMembers";
import { useUsersQuery } from "@/hooks/useUsers";

const COUNCIL_MEMBER_ROLES = ["Chairman", "Secretary", "Member"];

interface AddCouncilMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
}

export function AddCouncilMemberDialog({ open, onOpenChange, councilId }: AddCouncilMemberDialogProps) {
  const { data: users } = useUsersQuery();
  const addMutation = useAddCouncilMemberMutation(councilId);
  const [userId, setUserId] = useState<string | undefined>();
  const [memberRole, setMemberRole] = useState<string>(COUNCIL_MEMBER_ROLES[2]);
  const [isExternal, setIsExternal] = useState(false);

  const reset = () => {
    setUserId(undefined);
    setMemberRole(COUNCIL_MEMBER_ROLES[2]);
    setIsExternal(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add council member</DialogTitle>
          <DialogDescription>Invite a reviewer to this council (1 Chairman, 1 Secretary, 2 Members).</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Reviewer</label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select reviewer" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
            <Select value={memberRole} onValueChange={setMemberRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNCIL_MEMBER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={isExternal} onCheckedChange={(checked) => setIsExternal(Boolean(checked))} />
            External reviewer
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!userId || addMutation.isPending}
            onClick={() =>
              userId &&
              addMutation.mutate(
                { userId, memberRole, isExternal },
                {
                  onSuccess: () => {
                    reset();
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {addMutation.isPending && <Loader2 className="animate-spin" />}
            Add member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
