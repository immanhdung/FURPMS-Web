import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { useProjectInvitationsQuery, useRespondProjectOnBehalfMutation } from "@/hooks/useCouncilMembers";
import { useCouncilPolicyQuery } from "@/hooks/useSystemSettings";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";
import type { ReviewBoardCouncil } from "@/types/review-board";

/**
 * Trạng thái nhận lời của HỘI ĐỒNG với MỘT ĐỀ TÀI (03/10).
 *
 * Lời mời nay tính theo từng đề tài: hội đồng được gán thêm đề tài sau khi đã gửi thư mời thì mỗi thành
 * viên được mời riêng đề tài đó. Chip hiện "3/5 nhận lời" cạnh ô chọn hội đồng của đề tài; bấm vào mở
 * cửa sổ chi tiết từng thành viên (trạng thái, lý do từ chối, ghi nhận hộ). Trước đây trạng thái chỉ có
 * ở cấp hội đồng nên không biết ai đã nhận chấm đề tài nào.
 */
export function ProjectInviteStatus({
  council,
  councilLabel,
  projectId,
  projectTitle,
}: {
  council: ReviewBoardCouncil;
  councilLabel: string;
  projectId: string;
  projectTitle: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const summary = council.projectInvites?.find((p) => p.projectId === projectId);
  if (!summary || summary.total === 0) return null;

  const allSent = summary.notSent === 0;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t("projectInvite.open")}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-muted/60",
          summary.declined > 0
            ? "border-destructive/40 text-destructive"
            : summary.confirmed === summary.total
              ? "border-success/40 text-success"
              : "border-border text-muted-foreground"
        )}
      >
        <MailCheck className="size-3" />
        {!allSent
          ? t("projectInvite.chipNotSent")
          : summary.declined > 0
            ? t("projectInvite.chipWithDeclined", {
                confirmed: summary.confirmed,
                total: summary.total,
                n: summary.declined,
              })
            : t("projectInvite.chip", { confirmed: summary.confirmed, total: summary.total })}
      </button>
      {open && (
        <ProjectInviteDialog
          open={open}
          onOpenChange={setOpen}
          councilId={council.id}
          councilLabel={councilLabel}
          projectId={projectId}
          projectTitle={projectTitle}
        />
      )}
    </>
  );
}

function ProjectInviteDialog({
  open,
  onOpenChange,
  councilId,
  councilLabel,
  projectId,
  projectTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
  councilLabel: string;
  projectId: string;
  projectTitle: string;
}) {
  const { t } = useTranslation();
  const { data: rows, isLoading } = useProjectInvitationsQuery(councilId, projectId);
  const { data: policy } = useCouncilPolicyQuery();
  const respond = useRespondProjectOnBehalfMutation(councilId, projectId);
  const [declining, setDeclining] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("projectInvite.title", { council: councilLabel })}</DialogTitle>
          <DialogDescription>{projectTitle}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {(rows ?? []).map((r) => (
              <li key={r.memberId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {r.fullName ?? "—"}
                    {r.memberRole && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        · {t(`reviewBoard.role.${r.memberRole}`, { defaultValue: r.memberRole })}
                      </span>
                    )}
                  </p>
                  {r.respondedAt && (
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(r.respondedAt)}
                      {r.respondedOnBehalf && ` · ${t("projectInvite.onBehalf")}`}
                    </p>
                  )}
                  {r.status === "DECLINED" && (
                    <p className="text-xs text-destructive">
                      {r.declineReason?.trim()
                        ? t("reviewBoard.declineReason", { reason: r.declineReason.trim() })
                        : t("reviewBoard.declineNoReason")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {r.status === "NOT_SENT" ? (
                    <span className="text-xs text-muted-foreground">{t("projectInvite.notSent")}</span>
                  ) : (
                    <StatusBadge status={r.status} />
                  )}
                  {policy?.allowRespondOnBehalf && r.status === "INVITED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={t("reviewBoard.confirmOnBehalf")}
                        aria-label={t("reviewBoard.confirmOnBehalf")}
                        disabled={respond.isPending}
                        onClick={() => respond.mutate({ memberId: r.memberId, accept: true })}
                      >
                        <CheckCircle2 className="text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={t("reviewBoard.markDeclined")}
                        aria-label={t("reviewBoard.markDeclined")}
                        disabled={respond.isPending}
                        onClick={() => setDeclining(r.memberId)}
                      >
                        <XCircle className="text-danger" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">{t("projectInvite.hint")}</p>

        <ReasonDialog
          open={Boolean(declining)}
          onOpenChange={(o) => !o && setDeclining(null)}
          title={t("projectInvite.declineTitle")}
          hint={t("projectInvite.declineHint")}
          description={t("projectInvite.declineDescription")}
          confirmLabel={t("reviewBoard.markDeclined")}
          variant="destructive"
          isLoading={respond.isPending}
          onConfirm={(reason) =>
            declining &&
            respond.mutate(
              { memberId: declining, accept: false, declineReason: reason },
              { onSuccess: () => setDeclining(null) }
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
