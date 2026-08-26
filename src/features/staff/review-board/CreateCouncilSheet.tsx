import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FormSheet } from "@/components/shared/FormSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CouncilCandidateRow } from "@/components/shared/CouncilCandidateRow";
import { useCreateCouncilPackageMutation, useReviewBoardQuery } from "@/hooks/useReviewBoard";
import { useCouncilCandidatesQuery } from "@/hooks/useCouncilCandidates";
import type { CouncilPackageMember } from "@/types/review-board";

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
  const { data: board } = useReviewBoardQuery(cycleId, trackId);
  const { data: candidateData } = useCouncilCandidatesQuery({ trackId }, open);
  const createMutation = useCreateCouncilPackageMutation(cycleId, trackId);

  // Danh sách chọn ủy viên: xếp hạng theo chuyên môn (QĐ543 Điều 8.2, `GET /api/councils/candidates`
  // đã tự lọc vai Giảng viên/Hội đồng), trừ chủ nhiệm những đề tài ĐANG NẰM TRONG VÒNG này — hội
  // đồng lập ra là để chấm đúng nhóm đề tài đó (COI, rule #5). Endpoint không biết trước nhóm đề
  // tài này (chưa có councilId lẫn projectId cụ thể lúc tạo mới), nên COI theo vòng vẫn lọc ở đây.
  const roundPiIds = new Set(
    (board?.rounds ?? [])
      .filter((r) => r.id === roundId)
      .flatMap((r) => r.projects.map((p) => p.piUserId))
      .filter(Boolean)
  );
  const candidates = (candidateData?.candidates ?? []).filter((c) => !roundPiIds.has(c.userId));
  const trackName = candidateData?.trackName ?? null;

  const [rows, setRows] = useState<CouncilPackageMember[]>(() => [
    { userId: "", memberRole: "Chair", isExternal: false },
    { userId: "", memberRole: "Secretary", isExternal: false },
    { userId: "", memberRole: "Member", isExternal: false },
  ]);

  // Ngoài lĩnh vực (khác ngành hoặc chưa khai gì) cần Phòng QLKH ghi rõ lý do trước khi bấm tạo —
  // cùng luật với `AddCouncilMemberDialog` (thêm 1 người vào hội đồng có sẵn), chỉ khác đây phải
  // theo dõi lý do cho TỪNG dòng vì tạo cả gói nhiều người một lúc.
  const rowNeedsOverride = (row: CouncilPackageMember) => {
    const selected = candidates.find((c) => c.userId === row.userId);
    return Boolean(selected && !selected.matchesTrack && trackName != null);
  };
  const hasMissingNote = rows.some((r) => rowNeedsOverride(r) && !r.expertiseNote?.trim());

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
    if (hasMissingNote) return toast.error(t("staff.expertiseNoteRequired"));

    const payloadMembers = members.map((m) => {
      const needsOverride = rowNeedsOverride(m);
      return {
        userId: m.userId,
        memberRole: m.memberRole,
        isExternal: m.isExternal,
        acceptWithoutExpertise: needsOverride,
        expertiseNote: needsOverride ? m.expertiseNote?.trim() : undefined,
      };
    });

    createMutation.mutate(
      { roundId, payload: { projectIds: [], members: payloadMembers } },
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
          {rows.map((row, index) => {
            const selected = candidates.find((c) => c.userId === row.userId);
            const needsOverride = rowNeedsOverride(row);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Select value={row.userId || undefined} onValueChange={(v) => updateRow(index, { userId: v, expertiseNote: "" })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t("reviewBoard.selectReviewer")}>
                        {selected?.fullName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c) => (
                        <SelectItem
                          key={c.userId}
                          value={c.userId}
                          disabled={c.hasConflictOfInterest || c.alreadyInCouncil}
                        >
                          <CouncilCandidateRow candidate={c} showTrack={trackName != null} />
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

                {/* Ngoài lĩnh vực → cảnh báo + bắt ghi lý do, cùng luật với AddCouncilMemberDialog.
                    KHÔNG khoá cứng: có ca cần mời chuyên gia liên ngành. */}
                {needsOverride && selected && (
                  <div className="rounded-lg border border-warning bg-warning/10 p-3">
                    <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                      <span>
                        {selected.expertiseUnknown
                          ? t("staff.expertiseUnknownWarn", { name: selected.fullName })
                          : t("staff.expertiseMismatchWarn", { name: selected.fullName, track: trackName ?? "" })}
                      </span>
                    </p>
                    <p className="mt-1.5 pl-6 text-xs text-muted-foreground">{t("staff.expertiseHint")}</p>
                    <div className="mt-2 pl-6">
                      <Textarea
                        rows={2}
                        value={row.expertiseNote ?? ""}
                        onChange={(e) => updateRow(index, { expertiseNote: e.target.value })}
                        placeholder={t("staff.expertiseNotePlaceholder")}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FormSheet>
  );
}
