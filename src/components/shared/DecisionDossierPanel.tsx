import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileCheck2, Paperclip, ScrollText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectDecisionsQuery } from "@/hooks/useProjectDecisions";
import { formatDateTime } from "@/utils/format";
import { DECISION_STAGE_ORDER } from "@/types/project-decision";
import type { DecisionStage, ProjectDecision } from "@/types/project-decision";

/**
 * Hồ sơ quyết định của đề tài — nửa sau yêu cầu số (2) của hội đồng bảo vệ lần 2:
 * *"lưu trữ lại các quyết định liên quan đến đề tài"*.
 *
 * <p>Gom theo **chặng** chứ không đổ ra một danh sách phẳng: người mở hồ sơ thường đi tìm
 * *"chặng nghiệm thu đã quyết những gì"*, chứ hiếm khi cần đọc tuần tự từ đầu tới cuối.</p>
 *
 * <p>Mỗi dòng nói đủ bốn thứ mà hội đồng sẽ hỏi: <b>quyết gì · ai quyết (chức danh lúc đó) · lúc
 * nào · căn cứ văn bản nào</b>. Nội dung đầy đủ vẫn nằm ở bản gốc — đây là sổ đăng ký, không phải
 * bản sao.</p>
 */
export function DecisionDossierPanel({ projectId }: { projectId: string | null }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useProjectDecisionsQuery(projectId);

  // Máy chủ đã xếp sẵn theo ngày → thứ tự vòng đời; ở đây chỉ chia nhóm, KHÔNG sắp lại.
  const groups = useMemo(() => {
    const byStage = new Map<DecisionStage, ProjectDecision[]>();
    for (const d of data?.decisions ?? []) {
      const list = byStage.get(d.stage) ?? [];
      list.push(d);
      byStage.set(d.stage, list);
    }
    return DECISION_STAGE_ORDER.filter((s) => byStage.has(s)).map(
      (s) => [s, byStage.get(s)!] as const
    );
  }, [data]);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading || !data) return <Skeleton className="h-64 w-full rounded-xl" />;

  if (data.decisions.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title={t("decisions.empty")}
        description={t("decisions.emptyDesc")}
        className="min-h-32 border-none p-4"
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        {t("decisions.total", { n: data.totalCount })}
      </p>

      {groups.map(([stage, items]) => (
        <div key={stage}>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileCheck2 className="size-3.5" />
            </span>
            <p className="text-sm font-semibold text-foreground">
              {t(`decisions.stage.${stage}`, { defaultValue: stage })}
            </p>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>

          <ul className="space-y-2 border-l border-border pl-4">
            {items.map((d) => (
              <li key={d.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{d.summary}</p>
                  {d.result && <StatusBadge status={d.result} />}
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{formatDateTime(d.decidedAt)}</span>
                  {/* Chức danh là chức danh LÚC CHỐT — người đó nay có thể đã đổi vai hoặc nghỉ. */}
                  {d.decidedByRole && <span>· {d.decidedByRole}</span>}
                  {d.decidedByName && <span>· {d.decidedByName}</span>}
                  {d.documentNo && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                      {d.documentNo}
                    </span>
                  )}
                </p>

                {d.reason && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{d.reason}</p>
                )}

                {d.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {d.attachments.map((a) => (
                      <li key={a.id} className="flex items-center gap-1.5 text-xs text-primary">
                        <Paperclip className="size-3" />
                        <span className="truncate">{a.fileName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
