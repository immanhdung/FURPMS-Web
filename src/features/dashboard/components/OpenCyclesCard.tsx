import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarRange, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { CYCLE_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/utils/format";

/**
 * Đợt đang MỞ nhận đề cương (thầy 29/07: dashboard PI phải thấy "những đợt nào đang mở,
 * loại nào đang mở"). Mỗi đợt = đúng 1 loại đề tài (rule #7) nên hiện kèm loại + hạn nộp
 * + số ngày còn lại để PI biết còn kịp nộp không.
 */
export function OpenCyclesCard() {
  const { t } = useTranslation();
  const { data: cycles, isLoading } = useCyclesQuery();
  const { data: researchTypes } = useResearchTypesQuery();

  const open = (cycles ?? []).filter((c) => c.status?.toUpperCase() === CYCLE_STATUS.OPEN);
  const typeName = (id?: number | null) => researchTypes?.find((rt) => Number(rt.id) === Number(id))?.name;

  const daysLeft = (deadline?: string | null) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
    return Number.isFinite(diff) ? diff : null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarRange className="size-3.5" />
          </div>
          <CardTitle className="text-sm">{t("dashboard.pi.openCycles")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : open.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("dashboard.pi.noOpenCycles")}</p>
        ) : (
          <ul className="space-y-2">
            {open.map((c) => {
              const left = daysLeft(c.submissionDeadline);
              return (
                <li key={c.id} className="rounded-lg border border-border p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    {typeName(c.researchTypeId) && (
                      <Badge variant="secondary">{typeName(c.researchTypeId)}</Badge>
                    )}
                    {/* Sắp hết hạn thì cảnh báo đỏ để PI thấy ngay. */}
                    {left != null && (
                      <Badge variant={left <= 7 ? "destructive" : "outline"}>
                        {left >= 0 ? t("dashboard.pi.daysLeft", { n: left }) : t("dashboard.pi.closedDeadline")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("cycles.submissionDeadline")}: {formatDate(c.submissionDeadline)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          to={ROUTES.SUBMIT_PROPOSAL}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t("dashboard.actions.submitProposal")}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
