import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, Package, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { axiosClient } from "@/services/api/axiosClient";
import { formatDate, formatDateTime } from "@/utils/format";
import type { ApiResponse } from "@/types/common";
import type { AcceptanceDossier } from "@/types/acceptance-dossier";

/**
 * Hồ sơ để hội đồng NGHIỆM THU chấm.
 *
 * Vòng xét duyệt chỉ cần đọc đề cương, nhưng nghiệm thu phải nhìn được **đề tài đã làm
 * ra những gì** (`Process_Spec_v2` §Giai đoạn 8: báo cáo tiến độ · sản phẩm · báo cáo
 * tổng kết). Trước đây màn chấm nghiệm thu hiện y hệt vòng 1 — người chấm không có căn
 * cứ nào ngoài buổi họp trực tiếp.
 */
export function AcceptanceDossierPanel({
  councilId,
  proposalId,
}: {
  councilId: string;
  proposalId: string;
}) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["acceptance-dossier", councilId, proposalId],
    queryFn: () =>
      axiosClient
        .get<ApiResponse<AcceptanceDossier>>(`/councils/${councilId}/proposals/${proposalId}/dossier`)
        .then((res) => res.data.data),
    enabled: Boolean(councilId && proposalId),
  });

  if (isLoading) return <Skeleton className="h-56 w-full rounded-xl" />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Tóm tắt một dòng để hội đồng nắm ngay bức tranh trước khi đọc chi tiết. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
        {data.contractNumber && (
          <span className="text-muted-foreground">
            {t("dossier.contract")}: <b className="text-foreground">{data.contractNumber}</b>
          </span>
        )}
        <span className="text-muted-foreground">
          {t("dossier.productsPassed")}:{" "}
          <b className="text-foreground">
            {data.deliverablesPassed}/{data.deliverablesTotal}
          </b>
        </span>
        <span className="text-muted-foreground">
          {t("dossier.reportsCount", { n: data.progressReports.length })}
        </span>
      </div>

      {/* ── Báo cáo tiến độ: Staff đã đánh giá từng kỳ ra sao ── */}
      <section>
        <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <FileText className="size-4 text-primary" />
          {t("dossier.progressReports")}
        </h3>
        {data.progressReports.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("dossier.noProgressReports")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.progressReports.map((r) => (
              <li key={r.reportRound} className="space-y-1 px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {r.roundName || t("reports.roundN", { n: r.reportRound })}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-muted-foreground">{r.overallCompletionPct}%</span>
                    {r.evaluationResult ? (
                      <StatusBadge status={r.evaluationResult} />
                    ) : (
                      <Badge variant="outline">{t("dossier.notEvaluated")}</Badge>
                    )}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {formatDate(r.reportingPeriodStart)} – {formatDate(r.reportingPeriodEnd)}
                  {r.submittedAt && ` · ${t("dossier.submittedAt", { date: formatDateTime(r.submittedAt) })}`}
                </p>
                {r.evaluationComments && <p className="text-foreground">{r.evaluationComments}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Sản phẩm: căn cứ chính để kết luận đạt/không đạt ── */}
      <section>
        <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Package className="size-4 text-primary" />
          {t("dossier.deliverables")}
        </h3>
        {data.deliverables.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("dossier.noDeliverables")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.deliverables.map((d) => (
              <li key={d.id} className="space-y-1 px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {d.acceptanceStatus === "PASSED" ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : d.acceptanceStatus === "FAILED" ? (
                      <XCircle className="size-3.5 text-destructive" />
                    ) : null}
                    {d.productName}
                  </span>
                  {d.acceptanceStatus && <StatusBadge status={d.acceptanceStatus} />}
                </div>
                {d.description && <p className="text-muted-foreground">{d.description}</p>}
                <p className="text-muted-foreground">
                  {d.submittedAt
                    ? t("dossier.submittedAt", { date: formatDateTime(d.submittedAt) })
                    : t("dossier.notSubmitted")}
                  {!d.hasFile && ` · ${t("dossier.noFile")}`}
                </p>
                {d.qualityAssessment && <p className="text-foreground">{d.qualityAssessment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Báo cáo tổng kết (BM09) ── */}
      <section>
        <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <FileText className="size-4 text-primary" />
          {t("dossier.finalReport")}
        </h3>
        {data.finalReport ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border px-3 py-2 text-xs">
            <StatusBadge status={data.finalReport.status} />
            <span className="text-muted-foreground">
              {data.finalReport.submittedAt
                ? t("dossier.submittedAt", { date: formatDateTime(data.finalReport.submittedAt) })
                : t("dossier.notSubmitted")}
            </span>
            {!data.finalReport.hasFile && <span className="text-warning">{t("dossier.noFile")}</span>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("dossier.noFinalReport")}</p>
        )}
      </section>
    </div>
  );
}
