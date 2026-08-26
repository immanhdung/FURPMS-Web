import { useTranslation } from "react-i18next";
import { CircleCheck, CircleDashed, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { useProjectTimelineQuery } from "@/hooks/useProjectTimeline";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { ProjectStage } from "@/types/project-timeline";

/**
 * Dòng thời gian đầy đủ của một đề tài — trả lời yêu cầu số (2) của hội đồng bảo vệ lần 2:
 * *"thể hiện rõ các mốc thời gian deadline cho các giai đoạn của 1 đề tài"*.
 *
 * <p>Khác `ContractMilestoneTimeline` (chỉ các mốc của HỢP ĐỒNG, do FE tự ghép): panel này nhận
 * nguyên dòng thời gian **do máy chủ lắp**, gồm cả giai đoạn trước khi có hợp đồng (nộp đề cương,
 * chấm, họp hội đồng), và mỗi mốc kèm **căn cứ của hạn** để trả lời ngay câu *"hạn này ở đâu ra"*.</p>
 */
export function ProjectTimelinePanel({ projectId }: { projectId: string | null }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useProjectTimelineQuery(projectId);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading || !data) return <Skeleton className="h-64 w-full rounded-xl" />;

  if (data.stages.length === 0) {
    return (
      <EmptyState
        icon={CircleDashed}
        title={t("projectTimeline.empty")}
        description={t("projectTimeline.emptyDesc")}
        className="min-h-32 border-none p-4"
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4 shrink-0 text-destructive" />
          <span className="text-foreground">{t("projectTimeline.overdueSummary", { n: data.overdueCount })}</span>
        </div>
      )}

      {/* Trục dọc: chấm + đường nối, cùng hình hài với ContractMilestoneTimeline để hai màn nhìn
          như một hệ thống chứ không phải hai người làm. */}
      <ol className="relative space-y-0">
        {data.stages.map((stage, index) => (
          <StageRow key={`${stage.code}-${stage.entityId ?? index}`} stage={stage} isLast={index === data.stages.length - 1} />
        ))}
      </ol>
    </div>
  );
}

function StageRow({ stage, isLast }: { stage: ProjectStage; isLast: boolean }) {
  const { t } = useTranslation();
  const done = stage.status === "DONE";
  const overdue = stage.status === "OVERDUE";

  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {/* Đường nối chạy từ chấm này xuống chấm sau — mốc cuối thì không vẽ, tránh đường thừa. */}
      {!isLast && <span className="absolute left-[7px] top-5 h-full w-px bg-border" aria-hidden />}

      <span
        className={cn(
          "relative z-10 mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-background",
          done && "border-success",
          overdue && "border-destructive",
          !done && !overdue && "border-muted-foreground/40"
        )}
      >
        {done && <CircleCheck className="size-3 text-success" />}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm font-medium", overdue ? "text-destructive" : "text-foreground")}>
            {t(`projectTimeline.stage.${stage.code}`, { defaultValue: stage.code })}
          </span>

          {done ? (
            <span className="text-xs text-muted-foreground">
              {t("projectTimeline.doneOn", { date: formatDate(stage.actualDate) })}
            </span>
          ) : (
            <DeadlineBadge
              deadline={stage.deadline}
              daysLeft={stage.daysLeft}
              basis={stage.deadlineBasis}
              isExtended={stage.isExtended}
            />
          )}
        </div>

        {/* Căn cứ hiện THẲNG ra màn hình, không giấu trong tooltip: hội đồng hỏi "hạn này ở đâu ra"
            thì người demo chỉ vào màn hình đọc, không phải giở tài liệu. */}
        {stage.deadlineBasis && (
          <p className="text-xs text-muted-foreground">{stage.deadlineBasis}</p>
        )}
      </div>
    </li>
  );
}
