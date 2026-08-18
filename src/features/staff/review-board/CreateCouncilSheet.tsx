import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/useUsers";
import { useCreateCouncilPackageMutation, useReviewBoardQuery } from "@/hooks/useReviewBoard";
import type { CouncilPackageMember } from "@/types/review-board";
import { eligibleCouncilCandidates } from "@/utils/council-eligibility";

// Chuỗi role KHỚP CHÍNH XÁC với BE (check "Chair"/"Secretary") — KHÔNG dùng "Chairman".
const ROLES = ["Chair", "Secretary", "Member", "Opponent"];

interface CreateCouncilSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  trackId: number;
  roundId: string;
  roundNumber: number;
}

const emptyRow = (): CouncilPackageMember => ({ userId: "", memberRole: "Member", isExternal: false });

/**
 * Tạo hội đồng CHỈ với thành viên (không gán đề tài). Đề tài gán sau qua dropdown ở cột đề tài.
 * BE nhận projectIds rỗng (đã nới rule).
 */
export function CreateCouncilSheet({ open, onOpenChange, cycleId, trackId, roundId, roundNumber }: CreateCouncilSheetProps) {
  const { t } = useTranslation();
  const { data: users } = useUsersQuery();
  const { data: board } = useReviewBoardQuery(cycleId, trackId);
  const createMutation = useCreateCouncilPackageMutation(cycleId, trackId);

  // Danh sách chọn ủy viên: chỉ người đủ tư cách (giảng viên/hội đồng), trừ chủ nhiệm những đề tài
  // ĐANG NẰM TRONG VÒNG này — hội đồng lập ra là để chấm đúng nhóm đề tài đó (COI, rule #5).
  // Trước 18/08 chỗ này đổ thẳng toàn bộ `users`, nên Staff thấy cả tài khoản quản trị lẫn chính
  // chủ nhiệm đề tài, chọn xong mới bị BE trả lỗi.
  const roundPiIds = (board?.rounds ?? [])
    .filter((r) => r.id === roundId)
    .flatMap((r) => r.projects.map((p) => p.piUserId))
    .filter(Boolean);
  const candidates = eligibleCouncilCandidates(users, roundPiIds);

  const [rows, setRows] = useState<CouncilPackageMember[]>(() => [
    { userId: "", memberRole: "Chair", isExternal: false },
    { userId: "", memberRole: "Secretary", isExternal: false },
    { userId: "", memberRole: "Member", isExternal: false },
  ]);

  // Sao chép thành viên: gom mọi hội đồng đã có (kèm thành viên) của lĩnh vực này — ví dụ hội đồng
  // vòng Xét duyệt → clone sang vòng Nghiệm thu khỏi gõ lại (rule #16: 2 hội đồng riêng nhưng đỡ nhập).
  const copySources = (board?.rounds ?? []).flatMap((r) =>
    r.councils
      .filter((c) => c.members.length > 0 && c.id !== roundId)
      .map((c, ci) => ({
        id: c.id,
        label: `${t("staff.round", { num: r.roundNumber })} · ${t(`reviewBoard.type.${r.roundType}`)}${
          r.councils.length > 1 ? ` (HĐ ${ci + 1})` : ""
        }`,
        members: c.members,
      }))
  );

  const copyFrom = (councilId: string) => {
    const src = copySources.find((s) => s.id === councilId);
    if (!src) return;
    setRows(
      src.members.map((m) => ({
        userId: m.userId,
        memberRole: m.memberRole ?? "Member",
        isExternal: m.isExternal,
      }))
    );
  };

  const updateRow = (index: number, patch: Partial<CouncilPackageMember>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const members = rows.filter((r) => r.userId);
    if (members.length === 0) return toast.error(t("reviewBoard.needMember"));
    const hasChair = members.some((m) => m.memberRole.toLowerCase() === "chair");
    const hasSecretary = members.some((m) => m.memberRole.toLowerCase() === "secretary");
    if (!hasChair || !hasSecretary) return toast.error(t("reviewBoard.needChairSecretary"));
    // 1 người chỉ 1 vị trí (khớp validate BE) — báo sớm thay vì để BE trả 400.
    const ids = members.map((m) => m.userId);
    if (new Set(ids).size !== ids.length) return toast.error(t("reviewBoard.duplicateMember"));

    createMutation.mutate(
      { roundId, payload: { projectIds: [], members } },
      { onSuccess: () => { setRows([emptyRow()]); onOpenChange(false); } }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reviewBoard.createCouncilTitle")}
      description={t("reviewBoard.createCouncilDesc", { num: roundNumber })}
      formId="create-council-form"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitLabel={t("reviewBoard.createCouncil")}
    >
      {copySources.length > 0 && (
        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.copyMembers")}</label>
          <Select onValueChange={copyFrom}>
            <SelectTrigger>
              <SelectValue placeholder={t("reviewBoard.copyMembersPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {copySources.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">{t("reviewBoard.copyMembersHint")}</p>
        </div>
      )}

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
                  {candidates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                  {candidates.length === 0 && (
                    <p className="px-2 py-3 text-xs text-muted-foreground">{t("reviewBoard.noEligibleReviewer")}</p>
                  )}
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
