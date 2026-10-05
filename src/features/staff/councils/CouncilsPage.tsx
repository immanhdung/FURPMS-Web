import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Gavel,
  MapPin,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCouncilsQuery, useDeleteCouncilMutation } from "@/hooks/useCouncils";
import { formatDateTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import type { CouncilListItem } from "@/types/council";

/**
 * Màn quản lý hội đồng của Phòng QLKH.
 *
 * <b>Trước 14/08 màn này KHÔNG phải màn hội đồng</b>: nó render đúng bảng `ProposalsTable` — trùng
 * y hệt màn "Xét duyệt đề cương". Nghĩa là chuyên viên có hai mục menu hiện cùng một danh sách,
 * và <i>không có chỗ nào xem được hội đồng</i>. Nguyên nhân gốc là máy chủ không hề có endpoint
 * liệt kê hội đồng (chỉ có tạo/xoá/xem-của-tôi), nay đã bổ sung.
 *
 * Thứ tự sắp xếp cố ý đặt hội đồng <b>CHƯA sẵn sàng lên trước</b> — đó mới là việc tồn đọng cần
 * làm, còn hội đồng đã chạy ổn thì không cần nhìn tới.
 */
export function CouncilsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [notReadyOnly, setNotReadyOnly] = useState(false);
  const [deleting, setDeleting] = useState<CouncilListItem | null>(null);

  const { data: councils, isLoading } = useCouncilsQuery({
    search: search.trim() || undefined,
    notReadyOnly: notReadyOnly || undefined,
  });

  const remove = useDeleteCouncilMutation();

  const stats = useMemo(() => {
    const list = councils ?? [];
    return {
      total: list.length,
      notReady: list.filter((c) => c.missingForInvitation.length > 0).length,
      awaitingReply: list.filter((c) => c.invitationsSent && c.confirmedCount < c.invitedCount).length,
    };
  }, [councils]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <Gavel className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.councilsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("staff.councilsSubtitle")}</p>
        </div>
      </motion.div>

      {/* Ba con số trả lời đúng ba câu chuyên viên hỏi mỗi sáng. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t("council.statTotal")} value={stats.total} icon={Gavel} />
        <StatCard
          label={t("council.statNotReady")}
          value={stats.notReady}
          icon={AlertTriangle}
          tone={stats.notReady > 0 ? "warning" : "muted"}
        />
        <StatCard label={t("council.statAwaitingReply")} value={stats.awaitingReply} icon={Users} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder={t("council.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant={notReadyOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setNotReadyOnly((v) => !v)}
        >
          <AlertTriangle className="size-4" />
          {t("council.filterNotReady")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !councils?.length ? (
        <EmptyState icon={Gavel} title={t("council.emptyTitle")} description={t("council.emptyDesc")} />
      ) : (
        <div className="space-y-3">
          {councils.map((c) => (
            <CouncilCard
              key={c.id}
              council={c}
              onOpenRound={() => navigate(ROUTES.REVIEW_BOARD)}
              onDelete={() => setDeleting(c)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("council.deleteTitle")}
        description={t("council.deleteDesc")}
        variant="destructive"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "muted",
}: {
  label: string;
  value: number;
  icon: typeof Gavel;
  tone?: "muted" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={
            tone === "warning"
              ? "flex size-9 items-center justify-center rounded-lg bg-warning/15 text-warning"
              : "flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
          }
        >
          <Icon className="size-4.5" />
        </div>
        <div>
          <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CouncilCard({
  council: c,
  onOpenRound,
  onDelete,
}: {
  council: CouncilListItem;
  onOpenRound: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const ready = c.missingForInvitation.length === 0;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t(`reviewBoard.type.${c.councilType}`, { defaultValue: c.councilType })}</Badge>
              <StatusBadge status={c.status} />
              {c.trackName && <span className="text-sm font-medium text-foreground">{c.trackName}</span>}
              {c.cycleName && <span className="text-sm text-muted-foreground">· {c.cycleName}</span>}
            </div>
            {c.establishmentDecisionNo && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("council.decisionNo")}: {c.establishmentDecisionNo}
              </p>
            )}
          </div>

          <Button size="icon" variant="ghost" onClick={onDelete} aria-label={t("common.delete")}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Fact
            icon={Users}
            label={t("council.members")}
            // "5/3" đọc như phân số và gây hiểu nhầm là thiếu người. Nói rõ đâu là mức tối thiểu.
            value={t("council.memberCount", { n: c.memberCount, min: c.minMembersRequired })}
            hint={[c.chairName && `CT: ${c.chairName}`, c.secretaryName && `TK: ${c.secretaryName}`]
              .filter(Boolean)
              .join(" · ")}
          />
          <Fact
            icon={CheckCircle2}
            label={t("council.confirmed")}
            value={c.invitationsSent ? `${c.confirmedCount}/${c.invitedCount}` : "—"}
            hint={c.declinedCount > 0 ? t("council.declinedCount", { n: c.declinedCount }) : undefined}
          />
          <Fact icon={Gavel} label={t("council.projects")} value={String(c.projectCount)} />
          <Fact
            icon={c.nextMeetingLocation ? MapPin : Video}
            label={t("council.nextMeeting")}
            value={c.nextMeetingAt ? formatDateTime(c.nextMeetingAt) : "—"}
            hint={c.nextMeetingLocation ?? undefined}
          />
        </div>

        {/*
          Phần đáng giá nhất của màn này: nói RÕ còn thiếu gì để gửi được thư mời.
          Trước đây chuyên viên bấm "Gửi thư mời" rồi ăn lỗi từng cái một — sửa xong cái này bấm
          lại thì lòi ra cái tiếp theo.
        */}
        {ready ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/8 px-3 py-2 text-xs text-foreground">
            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
            {c.invitationsSent ? t("council.readySent") : t("council.readyToInvite")}
          </div>
        ) : (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <AlertTriangle className="size-3.5 shrink-0 text-warning" />
              {t("council.missingTitle")}
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-6 text-xs text-muted-foreground">
              {c.missingForInvitation.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onOpenRound}>
            <CalendarClock className="size-3.5" />
            {t("council.openBoard")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
