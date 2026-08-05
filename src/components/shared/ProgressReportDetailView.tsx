import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressReportQuery } from "@/hooks/useProgressReports";
import { formatDate } from "@/utils/format";

/**
 * Nội dung một kỳ báo cáo tiến độ (BM06) — dùng chung cho **cả hai vai**:
 * Staff xem trước khi đánh giá, và PI xem lại cái mình đã nộp.
 *
 * Danh sách `GET /progress-reports` chỉ trả bản tóm tắt (%, trạng thái); toàn bộ nội dung
 * nằm ở `GET /progress-reports/{id}`. Trước đây không nơi nào gọi ⇒ Staff không biết PI
 * viết gì, còn PI nộp xong thì cũng không xem lại được.
 */
export function ProgressReportDetailView({ reportId }: { reportId: string | null }) {
  const { t } = useTranslation();
  const { data: report, isLoading } = useProgressReportQuery(reportId);

  if (isLoading) return <Skeleton className="h-32 w-full rounded-lg" />;
  if (!report) return null;

  const sections = [
    ["reports.completedContent", report.completedContent],
    ["reports.pendingContent", report.pendingContent],
    ["reports.nextPeriodPlan", report.nextPeriodPlan],
    ["reports.piRecommendations", report.piRecommendations],
  ] as const;

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {report.roundName || t("reports.roundN", { n: report.reportRound })}
        </span>
        <span>
          {formatDate(report.reportingPeriodStart)} – {formatDate(report.reportingPeriodEnd)}
        </span>
        <span>
          {t("reports.completionPct")}: <b className="text-foreground">{report.overallCompletionPct}%</b>
        </span>
      </div>

      {sections.map(([key, value]) =>
        value?.trim() ? (
          <div key={key}>
            <p className="text-xs font-medium text-muted-foreground">{t(key)}</p>
            <p className="whitespace-pre-line text-sm text-foreground">{value}</p>
          </div>
        ) : null
      )}

      {/* Bảng tiến độ theo hoạt động (BM06) */}
      {report.items && report.items.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("reports.activityTable")}</p>
          <ul className="divide-y divide-border rounded-md border border-border">
            {report.items.map((it) => (
              <li key={it.id} className="flex items-start justify-between gap-3 px-2.5 py-1.5 text-xs">
                <span className="min-w-0">
                  <span className="text-foreground">{it.activityName}</span>
                  {it.notes && <span className="block text-muted-foreground">{it.notes}</span>}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{it.completionRate}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
