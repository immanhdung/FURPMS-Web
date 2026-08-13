import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Mail, UserPlus, UserX, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useRespondOnBehalfMutation,
  useCouncilMembersQuery,
  useRemoveCouncilMemberMutation,
} from "@/hooks/useCouncilMembers";
import { useSendInvitationsMutation } from "@/hooks/useCouncils";
import { AddCouncilMemberDialog } from "@/features/staff/proposal-reviews/AddCouncilMemberDialog";
import { formatDateTime } from "@/utils/format";
import type { CouncilMember } from "@/types/council-member";

interface CouncilMembersPanelProps {
  councilId: string;
  trackId?: string | null;
}

export function CouncilMembersPanel({ councilId, trackId }: CouncilMembersPanelProps) {
  const { t } = useTranslation();
  const { data: members, isLoading } = useCouncilMembersQuery(councilId);
  const sendInvitationsMutation = useSendInvitationsMutation(councilId);
  const respondOnBehalfMutation = useRespondOnBehalfMutation(councilId);
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
          <Button variant="outline" size="sm" onClick={() => sendInvitationsMutation.mutate({})} disabled={sendInvitationsMutation.isPending}>
            <Mail />
            {t("reviewBoard.sendInvitations")}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus />
            {t("reviewBoard.addMemberBtn")}
          </Button>
        </div>
      </div>

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
        <EmptyState icon={UserX} title={t("reviewBoard.noMembers")} description={t("reviewBoard.noMembersDesc")} className="min-h-32 border-none p-4" />
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.reviewerName ?? member.userId}
                  {member.memberRole && <span className="ml-1.5 text-xs text-muted-foreground">· {member.memberRole}</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.reviewerEmail}</p>
                {member.confirmedAt && (
                  <p className="text-[11px] text-muted-foreground">{t("reviewBoard.confirmedAt", { at: formatDateTime(member.confirmedAt) })}</p>
                )}
                {member.declinedAt && (
                  <p className="text-[11px] text-muted-foreground">{t("reviewBoard.declinedAt", { at: formatDateTime(member.declinedAt) })}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {member.status && <StatusBadge status={member.status} />}
                {/* "Xác nhận thay": Staff bấm hộ (reviewer đồng ý ngoài hệ thống / tiện demo).
                    Trước đây nút này gọi /respond → BE chặn 403 vì Staff không phải chính reviewer;
                    giờ dùng endpoint confirm-on-behalf. Hiện cả khi ASSIGNED lẫn INVITED. */}
                {/* CHỈ hiện khi đã GỬI thư mời. Trước đây hiện cả lúc mới gán người (ASSIGNED) —
                    ghi nhận "đã trả lời" khi chưa có thư nào để trả lời là hồ sơ tự mâu thuẫn,
                    và máy chủ nay chặn hẳn. */}
                {member.status?.toLowerCase() === "invited" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={t("reviewBoard.confirmOnBehalf")}
                    aria-label={t("reviewBoard.confirmOnBehalf")}
                    disabled={respondOnBehalfMutation.isPending}
                    onClick={() => respondOnBehalfMutation.mutate({ memberId: member.id, accept: true })}
                  >
                    <CheckCircle2 className="text-success" />
                  </Button>
                )}
                {/* Nút này TỪNG GỌI NHẦM endpoint dành cho chính thành viên (`PATCH /respond`)
                    nên chuyên viên luôn ăn 403 "Bạn chỉ trả lời được thư mời gửi cho chính mình".
                    Nhánh xác nhận đã chuyển sang endpoint riêng từ trước, nhánh từ chối bị bỏ sót. */}
                {member.status?.toLowerCase() === "invited" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={t("reviewBoard.markDeclined")}
                    aria-label={t("reviewBoard.markDeclined")}
                    disabled={respondOnBehalfMutation.isPending}
                    onClick={() => respondOnBehalfMutation.mutate({ memberId: member.id, accept: false })}
                  >
                    <XCircle className="text-danger" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" title={t("reviewBoard.removeMember")} aria-label={t("reviewBoard.removeMember")} onClick={() => setRemovingMember(member)}>
                  <UserX />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddCouncilMemberDialog open={addOpen} onOpenChange={setAddOpen} councilId={councilId} trackId={trackId} />

      <ConfirmDialog
        open={Boolean(removingMember)}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        title={t("reviewBoard.removeMember")}
        description={t("reviewBoard.removeMemberDesc", { name: removingMember?.reviewerName ?? t("reviewBoard.thisMember") })}
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
