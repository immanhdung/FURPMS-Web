import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/useUsers";
import { useCreateCouncilPackageMutation } from "@/hooks/useReviewBoard";
import type { CouncilPackageMember } from "@/types/review-board";
import type { ReviewBoardRound } from "@/types/review-board";

// Chuỗi role KHỚP CHÍNH XÁC với BE (CreateCouncilPackageAsync check "Chair"/"Secretary").
// Lưu ý: KHÔNG dùng COUNCIL_MEMBER_ROLE (giá trị "Chairman") — BE sẽ 400.
const ROLES = ["Chair", "Secretary", "Member", "Opponent"];

interface CreateCouncilPackageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  trackId: number;
  round: ReviewBoardRound;
}

type MemberRow = CouncilPackageMember;

const emptyRow = (): MemberRow => ({ userId: "", memberRole: "Member", isExternal: false });

export function CreateCouncilPackageSheet({ open, onOpenChange, cycleId, trackId, round }: CreateCouncilPackageSheetProps) {
  const { t } = useTranslation();
  const { data: users } = useUsersQuery();
  const createMutation = useCreateCouncilPackageMutation(cycleId, trackId);

  const [projectIds, setProjectIds] = useState<string[]>(() => round.projects.map((p) => p.projectId));
  const [rows, setRows] = useState<MemberRow[]>(() => [
    { userId: "", memberRole: "Chair", isExternal: false },
    { userId: "", memberRole: "Secretary", isExternal: false },
    { userId: "", memberRole: "Member", isExternal: false },
  ]);

  const toggleProject = (id: string, checked: boolean) =>
    setProjectIds((prev) => (checked ? [...prev, id] : prev.filter((p) => p !== id)));

  const updateRow = (index: number, patch: Partial<MemberRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const members = rows.filter((r) => r.userId);
    if (projectIds.length === 0) return toast.error(t("reviewBoard.needProject"));
    if (members.length === 0) return toast.error(t("reviewBoard.needMember"));
    const hasChair = members.some((m) => m.memberRole.toLowerCase() === "chair");
    const hasSecretary = members.some((m) => m.memberRole.toLowerCase() === "secretary");
    if (!hasChair || !hasSecretary) return toast.error(t("reviewBoard.needChairSecretary"));

    createMutation.mutate(
      { roundId: round.id, payload: { projectIds, members } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reviewBoard.createCouncilTitle")}
      description={t("reviewBoard.createCouncilDesc", { num: round.roundNumber })}
      formId="create-council-package-form"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitLabel={t("reviewBoard.createCouncil")}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.councilProjects")}</label>
        <div className="space-y-1.5 rounded-lg border border-border p-2.5">
          {round.projects.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("reviewBoard.noProjectsInRound")}</p>
          ) : (
            round.projects.map((p) => (
              <label key={p.projectId} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={projectIds.includes(p.projectId)}
                  onCheckedChange={(c) => toggleProject(p.projectId, Boolean(c))}
                />
                <span className="truncate">{p.titleVi}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">{t("reviewBoard.councilMembers")}</label>
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
            <Plus className="size-3.5" />
            {t("reviewBoard.addMemberRow")}
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">{t("reviewBoard.needChairSecretaryHint")}</p>

        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select value={row.userId || undefined} onValueChange={(v) => updateRow(index, { userId: v })}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("reviewBoard.selectReviewer")} />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={row.memberRole} onValueChange={(v) => updateRow(index, { memberRole: v })}>
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`reviewBoard.role.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("common.remove")}
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </FormSheet>
  );
}
