import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, UserPlus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCouncilMembersQuery, useRemoveCouncilMemberMutation } from "@/hooks/useCouncilMembers";
import { useSendInvitationsMutation } from "@/hooks/useCouncils";
import { AddCouncilMemberDialog } from "@/features/staff/proposal-reviews/AddCouncilMemberDialog";
import type { CouncilMember } from "@/types/council-member";

interface CouncilMembersPanelProps {
  councilId: string;
  trackId?: string | null;
  roundType?: string;
}

export function CouncilMembersPanel({ councilId, trackId, roundType }: CouncilMembersPanelProps) {
  const { t } = useTranslation();
  const { data: members, isLoading } = useCouncilMembersQuery(councilId);
  const sendInvitationsMutation = useSendInvitationsMutation(councilId);
  const removeMutation = useRemoveCouncilMemberMutation(councilId);

  const [addOpen, setAddOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<CouncilMember | null>(null);

  /**
   * QĐ543 Điều 8.2 / 12.2 + chốt của thầy 08/08: số thành viên phải **LẺ**.
   * Báo NGAY khi đang gán người, thay vì để tới lúc bấm "Gửi thư mời" mới ăn 409 từ BE —
   * lúc đó Staff đã mất công gán xong xuôi rồi.
   */
  const memberCount = members?.length ?? 0;
  const isEvenCount = memberCount > 0 && memberCount % 2 === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {t("reviewBoard.members")}
          {memberCount > 0 && <span className="ml-1.5 text-xs text-muted-foreground">({memberCount})</span>}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendInvitationsMutation.mutate({})}
            disabled={sendInvitationsMutation.isPending}
          >
            <Mail />
            {t("reviewBoard.sendInvitations")}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus />
            {t("reviewBoard.addMemberBtn")}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("projectInvite.membersHint")}</p>

      {/* Giải thích VÌ SAO phải lẻ, không chỉ báo "sai" — mọi thành viên đều chấm, Thư ký dựa vào
          chênh lệch phiếu để soạn kết luận, Chủ tịch xem lại rồi mới ký. Hoà phiếu là không có
          căn cứ nào để viết. */}
      {isEvenCount && (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          {t("reviewBoard.evenMembersWarning", { n: memberCount })}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <EmptyState
          icon={UserX}
          title={t("reviewBoard.noMembers")}
          description={t("reviewBoard.noMembersDesc")}
          className="min-h-32 border-none p-4"
        />
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.reviewerName ?? member.userId}
                  {member.memberRole && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      · {t(`reviewBoard.role.${member.memberRole}`, { defaultValue: member.memberRole })}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.reviewerEmail}</p>
                {/* Lý do mời dù khác lĩnh vực (QĐ543 Điều 8.2) — lưu lúc thêm người, cũng được ghi vào
                    hồ sơ quyết định của từng đề tài khi gán đề tài cho hội đồng. */}
                {member.expertiseNote && (
                  <p className="mt-0.5 text-xs text-warning">
                    {t("reviewBoard.expertiseNoteLine", { note: member.expertiseNote })}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {/* 03/10: trạng thái nhận lời nay tính THEO TỪNG ĐỀ TÀI — xem ở chip cạnh mỗi đề tài trong danh
                    sách đề tài của phiên (bấm vào mở cửa sổ trạng thái + ghi nhận hộ). Màn quản lý chỉ còn
                    gán / gỡ người, không lặp lại trạng thái cấp hội đồng dễ gây hiểu nhầm. */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title={t("reviewBoard.removeMember")}
                  aria-label={t("reviewBoard.removeMember")}
                  onClick={() => setRemovingMember(member)}
                >
                  <UserX />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddCouncilMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        councilId={councilId}
        trackId={trackId}
        roundType={roundType}
      />

      <ConfirmDialog
        open={Boolean(removingMember)}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        title={t("reviewBoard.removeMember")}
        description={t("reviewBoard.removeMemberDesc", {
          name: removingMember?.reviewerName ?? t("reviewBoard.thisMember"),
        })}
        variant="destructive"
        confirmLabel={t("reviewBoard.remove")}
        isLoading={removeMutation.isPending}
        onConfirm={() =>
          removingMember && removeMutation.mutate(removingMember.id, { onSuccess: () => setRemovingMember(null) })
        }
      />
    </div>
  );
}
