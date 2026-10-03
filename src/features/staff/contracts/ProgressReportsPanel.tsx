import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  ClipboardCheck,
  ExternalLink,
  FileBarChart,
  CalendarPlus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressMinutesLinks } from "@/components/shared/ProgressMinutesLinks";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useDeleteProgressReportMutation,
  useResetProgressRoundsMutation,
  useReopenProgressReportMutation,
  useGenerateProgressRoundsMutation,
  useProgressReportQuery,
  useProgressReportsQuery,
} from "@/hooks/useProgressReports";
import { ScheduleProgressReportDialog } from "@/features/staff/contracts/ScheduleProgressReportDialog";
import { ProgressSchedulePreview } from "@/features/staff/contracts/ProgressSchedulePreview";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { EvaluateProgressReportDialog } from "@/features/staff/contracts/EvaluateProgressReportDialog";
import { externalUrl, formatDate, formatDateTime } from "@/utils/format";
import { ProgressReportDetailSheet } from "@/components/shared/DossierDetailSheet";

export function ProgressReportsPanel({
  contractId,
  contractStartDate,
  contractEndDate,
  defaultRounds = 1,
}: {
  contractId: string;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  /** Số kỳ mặc định theo loại đề tài — QĐ543 Điều 10.1 (Ứng dụng 2, Cơ bản 1). */
  defaultRounds?: number;
}) {
  // Chi tiết nạp riêng: danh sách chỉ trả bản tóm tắt, không có nội dung PI đã gõ.
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const { data: openReport } = useProgressReportQuery(openReportId);
  const { t } = useTranslation();
  const { data: reports, isLoading } = useProgressReportsQuery(contractId);
  const generateMutation = useGenerateProgressRoundsMutation(contractId);
  const deleteMutation = useDeleteProgressReportMutation(contractId);
  const resetMutation = useResetProgressRoundsMutation(contractId);
  const [resetting, setResetting] = useState(false);
  const reopenMutation = useReopenProgressReportMutation(contractId);
  const [reopeningReportId, setReopeningReportId] = useState<string | null>(null);
  // Xoá bản ĐÃ NỘP (nộp nhầm) — khác xoá bản nháp ở chỗ phải ghi lý do.
  const [removingSubmittedId, setRemovingSubmittedId] = useState<string | null>(null);
  // Mặc định tạo đúng số kỳ theo quy định; "Tùy chỉnh" mới hiện ô nhập số kỳ.
  const [customMode, setCustomMode] = useState(false);

  const [schedulingReportId, setSchedulingReportId] = useState<string | null>(null);
  const [evaluatingReportId, setEvaluatingReportId] = useState<string | null>(null);
  const [roundCount, setRoundCount] = useState("");
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const plannedCount = customMode && roundCount ? Number(roundCount) : defaultRounds;
  const existingRounds = (reports ?? []).map((r) => r.reportRound ?? 0);
  const missingByRule = existingRounds.length < defaultRounds;
  // "Lập lại theo mẫu" chỉ khi mọi kỳ còn nháp — kỳ đã nộp / có kết luận phải xoá riêng hoặc mở lại (03/10).
  const canReset =
    (reports ?? []).length > 0 && (reports ?? []).every((r) => r.status === "DRAFT" && !r.evaluationResult);

  return (
    <div className="space-y-3">
      {/* QĐ543 Điều 10.1: Ứng dụng 2 kỳ (cuối giai đoạn 1 và 2), Cơ bản 1 kỳ (giữa thời hạn).
          03/10: nút chính tạo ĐÚNG số kỳ theo quy định; muốn khác (thầy 29/07: không fix cứng) thì
          bấm "Tùy chỉnh" mới hiện ô nhập số kỳ — trước đây ô số kỳ luôn hiện, Staff gõ thử 3 là
          ra lịch 3 kỳ chồng lên kỳ đã có. Đủ kỳ theo quy định rồi thì chỉ còn link "Tùy chỉnh". */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {(missingByRule || customMode) && (
          <span className="mr-auto text-xs text-muted-foreground">
            {t(defaultRounds >= 2 ? "reports.ruleApplied" : "reports.ruleBasic")}
          </span>
        )}
        {customMode ? (
          <>
            <label htmlFor="round-count" className="text-xs text-muted-foreground">
              {t("reports.roundCount")}
            </label>
            <Input
              id="round-count"
              type="number"
              min={1}
              max={12}
              className="w-20"
              placeholder={String(defaultRounds)}
              value={roundCount}
              onChange={(e) => setRoundCount(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmGenerate(true)}
              disabled={generateMutation.isPending || existingRounds.length >= plannedCount}
            >
              <CalendarPlus />
              {t("reports.generateCustom")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomMode(false);
                setRoundCount("");
              }}
            >
              {t("common.cancel")}
            </Button>
          </>
        ) : (
          <>
            {missingByRule && (
              <Button size="sm" onClick={() => setConfirmGenerate(true)} disabled={generateMutation.isPending}>
                <CalendarPlus />
                {t("reports.generateByRule", { n: defaultRounds })}
              </Button>
            )}
            {canReset && (
              <Button variant="ghost" size="sm" onClick={() => setResetting(true)}>
                <RotateCcw />
                {t("reports.resetToTemplate", { n: defaultRounds })}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setCustomMode(true)}>
              {t("reports.customize")}
            </Button>
          </>
        )}
      </div>

      {/* Xem trước lịch sẽ tạo: hợp đồng từ đâu tới đâu, mấy kỳ, mỗi kỳ hạn ngày nào (01/10).
          Đủ kỳ rồi thì thôi — các kỳ đã tạo có thể đã dời ngày, xem trước lúc đó chỉ gây rối. */}
      {existingRounds.length < plannedCount && (
        <ProgressSchedulePreview
          startDate={contractStartDate}
          endDate={contractEndDate}
          count={plannedCount}
          isDefault={!customMode || !roundCount}
          existingRounds={existingRounds}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title={t("reports.noProgressYet")}
          description={t("reports.staffNoProgress")}
          className="min-h-32 border-none p-4"
        />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="space-y-2 rounded-lg border border-border p-3">
              <button
                type="button"
                onClick={() => setOpenReportId(report.id)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("dossier.viewDetail")}
              </button>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {/* Tên đợt Staff đặt; chưa đặt thì hiện "Kỳ {số}". */}
                  {report.roundName || t("reports.roundN", { n: report.reportRound ?? "" })}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
                  </span>
                </p>
                {report.status ? (
                  <StatusBadge status={report.status} />
                ) : !report.submittedAt ? (
                  <span className="text-xs text-muted-foreground">{t("reports.notSubmittedYet")}</span>
                ) : null}
              </div>

              {report.dueDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {t("reports.dueOn", { date: formatDate(report.dueDate) })}
                  {/* Kỳ CHƯA nộp mới cần đếm ngược; nộp rồi thì hạn hết ý nghĩa. */}
                  {!report.submittedAt && <DeadlineBadge deadline={report.dueDate} daysLeft={report.daysLeft} />}
                  {report.scheduledMeetingAt &&
                    ` · ${t("reports.workingSessionAt", { datetime: formatDateTime(report.scheduledMeetingAt) })}`}
                </p>
              )}

              {report.meetingLink && (
                <a
                  href={externalUrl(report.meetingLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t("reports.joinLink")}
                </a>
              )}

              {report.evaluationResult && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    {t("reports.evaluationLabel")} <StatusBadge status={report.evaluationResult} />
                    {report.evaluationComments && ` — ${report.evaluationComments}`}
                  </p>
                  <ProgressMinutesLinks reportId={report.id} />
                </div>
              )}

              {/* Đã có kết luận hội đồng thì kỳ đóng lại — không đặt lịch / ghi nhận lại nữa (BE cũng
                  chỉ nhận kỳ đang ở trạng thái Đã nộp). Trước 01/10 hai nút này hiện mãi. */}
              {/* Đã có kết luận: chỉ còn "Mở lại" (ghi nhầm kết luận, tải nhầm biên bản…) — lý do
                  bắt buộc, vào sổ quyết định; BE chặn nếu kết luận Đạt đã dùng để chi tiền. */}
              {report.evaluationResult && (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setReopeningReportId(report.id)}>
                    <RotateCcw />
                    {t("reports.reopen")}
                  </Button>
                </div>
              )}

              {(!report.evaluationResult || report.status === "DRAFT") && (
                <div className="flex gap-2 pt-1">
                  {!report.evaluationResult && (
                    <Button variant="outline" size="sm" onClick={() => setSchedulingReportId(report.id)}>
                      <CalendarClock />
                      {t("reports.scheduleSession")}
                    </Button>
                  )}
                  {report.status === "SUBMITTED" && (
                    <Button size="sm" onClick={() => setEvaluatingReportId(report.id)}>
                      <ClipboardCheck />
                      {t("reports.evaluateReport")}
                    </Button>
                  )}
                  {report.status === "DRAFT" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingReportId(report.id)}
                    >
                      <Trash2 />
                      {t("common.delete")}
                    </Button>
                  )}
                  {/* Bản đã nộp mà sai (nộp nhầm kỳ, tạo trùng) — xoá được nhưng phải ghi lý do. */}
                  {report.status === "SUBMITTED" && !report.evaluationResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRemovingSubmittedId(report.id)}
                    >
                      <Trash2 />
                      {t("common.delete")}
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ScheduleProgressReportDialog
        open={Boolean(schedulingReportId)}
        onOpenChange={(open) => !open && setSchedulingReportId(null)}
        contractId={contractId}
        reportId={schedulingReportId}
        contractStartDate={contractStartDate}
        contractEndDate={contractEndDate}
      />
      <EvaluateProgressReportDialog
        open={Boolean(evaluatingReportId)}
        onOpenChange={(open) => !open && setEvaluatingReportId(null)}
        contractId={contractId}
        reportId={evaluatingReportId}
      />
      <ProgressReportDetailSheet
        item={openReport ?? null}
        open={Boolean(openReportId)}
        onOpenChange={(o) => !o && setOpenReportId(null)}
      />
      <ConfirmDialog
        open={confirmGenerate}
        onOpenChange={setConfirmGenerate}
        title={t("reports.generateRoundsTitle")}
        description={t("reports.generateRoundsDescription", {
          count: plannedCount,
        })}
        confirmLabel={t("reports.generateRounds")}
        isLoading={generateMutation.isPending}
        onConfirm={() =>
          generateMutation.mutate(customMode && roundCount ? Number(roundCount) : undefined, {
            onSuccess: () => {
              setConfirmGenerate(false);
              setCustomMode(false);
              setRoundCount("");
            },
          })
        }
      />
      {/* 03/10: bỏ một kỳ khỏi lịch cũng là quyết định (số kỳ tiến độ chi phối các đợt giải ngân giữa) ⇒ lý do. */}
      <ReasonDialog
        open={Boolean(deletingReportId)}
        onOpenChange={(open) => !open && setDeletingReportId(null)}
        title={t("reports.deleteRoundTitle")}
        description={t("reports.deleteRoundDescription")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={(reason) =>
          deletingReportId &&
          deleteMutation.mutate({ id: deletingReportId, reason }, { onSuccess: () => setDeletingReportId(null) })
        }
      />
      <ReasonDialog
        open={resetting}
        onOpenChange={setResetting}
        title={t("reports.resetTitle")}
        description={t("reports.resetDescription", { n: defaultRounds })}
        confirmLabel={t("reports.resetToTemplate", { n: defaultRounds })}
        isLoading={resetMutation.isPending}
        onConfirm={(reason) => resetMutation.mutate(reason, { onSuccess: () => setResetting(false) })}
      />
      <ReasonDialog
        open={Boolean(reopeningReportId)}
        onOpenChange={(open) => !open && setReopeningReportId(null)}
        title={t("reports.reopenTitle")}
        description={t("reports.reopenDescription")}
        confirmLabel={t("reports.reopen")}
        isLoading={reopenMutation.isPending}
        onConfirm={(reason) =>
          reopeningReportId &&
          reopenMutation.mutate({ id: reopeningReportId, reason }, { onSuccess: () => setReopeningReportId(null) })
        }
      />
      <ReasonDialog
        open={Boolean(removingSubmittedId)}
        onOpenChange={(open) => !open && setRemovingSubmittedId(null)}
        title={t("reports.deleteSubmittedTitle")}
        description={t("reports.deleteSubmittedDescription")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={(reason) =>
          removingSubmittedId &&
          deleteMutation.mutate({ id: removingSubmittedId, reason }, { onSuccess: () => setRemovingSubmittedId(null) })
        }
      />
    </div>
  );
}
