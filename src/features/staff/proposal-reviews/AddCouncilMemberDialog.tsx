import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCouncilMemberMutation } from "@/hooks/useCouncilMembers";
import { useUsersQuery } from "@/hooks/useUsers";
import { useSuggestReviewersMutation } from "@/hooks/useProposalAi";
import { COUNCIL_MEMBER_ROLE } from "@/constants/statuses";

const COUNCIL_MEMBER_ROLES = Object.values(COUNCIL_MEMBER_ROLE);

interface AddCouncilMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
  trackId?: string | null;
}

export function AddCouncilMemberDialog({ open, onOpenChange, councilId, trackId }: AddCouncilMemberDialogProps) {
  const { t } = useTranslation();
  const { data: users } = useUsersQuery();
  const addMutation = useAddCouncilMemberMutation(councilId);
  const suggestMutation = useSuggestReviewersMutation();
  const [userId, setUserId] = useState<string | undefined>();
  const [suggestedName, setSuggestedName] = useState<string | undefined>();
  const [memberRole, setMemberRole] = useState<string>(COUNCIL_MEMBER_ROLES[2]);
  const [isExternal, setIsExternal] = useState(false);

  const reset = () => {
    setUserId(undefined);
    setSuggestedName(undefined);
    setMemberRole(COUNCIL_MEMBER_ROLES[2]);
    setIsExternal(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("staff.addMember")}</DialogTitle>
          <DialogDescription>{t("staff.addMemberDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">{t("staff.reviewer")}</label>
              {trackId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs text-primary"
                  onClick={() => suggestMutation.mutate(trackId)}
                  disabled={suggestMutation.isPending}
                >
                  {suggestMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {t("staff.suggestAi")}
                </Button>
              )}
            </div>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t("staff.selectReviewer")} />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {suggestedName && !userId && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("staff.aiSuggestNote", { name: suggestedName })}
              </p>
            )}
          </div>

          {suggestMutation.data && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("staff.aiSuggested")}</p>
              {suggestMutation.data.map((suggestion, index) => (
                <motion.button
                  key={suggestion.userId}
                  type="button"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.05 }}
                  onClick={() => setSuggestedName(suggestion.fullName)}
                  className="w-full rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-foreground">{suggestion.fullName}</p>
                    <Badge variant="secondary">{t("staff.matchScore", { score: suggestion.matchScore })}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{suggestion.reason}</p>
                </motion.button>
              ))}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("staff.role")}</label>
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
            {t("staff.externalReviewer")}
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            {t("common.cancel")}
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
            {t("staff.addMemberBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
