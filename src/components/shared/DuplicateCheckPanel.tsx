import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CircleCheck, CircleHelp, Loader2, ScanSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  useDuplicateCheckQuery,
  useExplainDuplicateMutation,
  useReviewDuplicateMutation,
} from "@/hooks/useDuplicateCheck";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { DUPLICATE_VERDICTS } from "@/types/duplicate-check";
import type { DuplicateMatch, DuplicateVerdict } from "@/types/duplicate-check";

/**
 * Rà trùng lặp đề cương — gạch 3 của biên bản hội đồng bảo vệ lần 2.
 *
 * <p><b>Hai tầng.</b> Danh sách đối chiếu (tầng 1) luôn có sẵn, không tốn gì. Nút "Nhờ AI giải
 * thích" (tầng 2) chỉ hiện khi thực sự có cặp vượt ngưỡng — gọi mô hình sinh chữ tốn quota nên
 * không mời người dùng bấm vô cớ.</p>
 *
 * <p><b>Hệ thống không kết luận thay người.</b> Nó xếp thứ tự và giải thích; Phòng QLKH chốt kết
 * luận ở cuối panel, và kết luận đó vào sổ quyết định của đề tài.</p>
 *
 * <p>⚠️ Đừng nhầm với cảnh báo FE-08 trong tài liệu cũ — hai chiều ngược nhau: FE-08 so đề cương
 * với <b>đơn đặt hàng</b> và cảnh báo khi điểm <b>THẤP</b>; ở đây so với <b>kho đề tài đã có</b> và
 * cảnh báo khi điểm <b>CAO</b>.</p>
 */
export function DuplicateCheckPanel({
  proposalId,
  canReview = false,
}: {
  proposalId: string | null;
  canReview?: boolean;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useDuplicateCheckQuery(proposalId);
  const explainMutation = useExplainDuplicateMutation(proposalId ?? "");
  const reviewMutation = useReviewDuplicateMutation(proposalId ?? "");

  const [verdict, setVerdict] = useState<DuplicateVerdict | undefined>();
  const [note, setNote] = useState("");

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading || !data) return <Skeleton className="h-56 w-full rounded-xl" />;

  if (!data.indexed) {
    return (
      <EmptyState
        icon={ScanSearch}
        title={t("duplicate.notIndexed")}
        description={t("duplicate.notIndexedDesc")}
        className="min-h-32 border-none p-4"
      />
    );
  }

  const flagged = data.matches.filter((m) => m.severity !== "LOW");
  // Kết luận "trùng" hoặc "cần sửa" phải kèm căn cứ — BE cũng chặn, đây chỉ để khỏi ăn lỗi.
  const noteMissing = Boolean(verdict) && verdict !== "NOT_DUPLICATE" && !note.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t("duplicate.corpus", { n: data.corpusSize })} ·{" "}
          {t("duplicate.threshold", { value: data.warnThreshold })}
        </p>
        {flagged.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={explainMutation.isPending}
            onClick={() => explainMutation.mutate(Boolean(data.explanation))}
          >
            {explainMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {data.explanation ? t("duplicate.explainAgain") : t("duplicate.explain")}
          </Button>
        )}
      </div>

      {/* Không có gì vượt ngưỡng cũng là một kết quả — nói ra, đừng để trống trơ. */}
      {flagged.length === 0 ? (
        <div className="rounded-lg border border-success/40 bg-success/5 p-3.5">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{t("duplicate.noneFlagged", { n: data.corpusSize })}</span>
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-warning bg-warning/10 p-3.5">
          <p className="flex items-start gap-2 text-sm font-medium text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{t("duplicate.flaggedWarn", { n: flagged.length })}</span>
          </p>
          <p className="mt-1.5 pl-6 text-xs text-muted-foreground">{t("duplicate.notABlocker")}</p>
        </div>
      )}

      <ul className="space-y-2">
        {data.matches.map((m) => (
          <MatchRow key={m.proposalId} match={m} />
        ))}
      </ul>

      {data.explanation && (
        <div className="rounded-lg border border-border bg-muted/40 p-3.5">
          <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            <span>{t("duplicate.aiExplanation")}</span>
            {data.explanationModel && <span>· {data.explanationModel}</span>}
            {data.explanationGeneratedAt && <span>· {formatDateTime(data.explanationGeneratedAt)}</span>}
          </p>
          {/* AI viết ra để người đọc, không phải để hệ thống hành động theo. */}
          <p className="whitespace-pre-wrap text-sm text-foreground">{data.explanation}</p>
        </div>
      )}

      {/* ── Người trong vòng lặp ────────────────────────────────────────── */}
      {data.verdict ? (
        <div className="rounded-lg border border-border p-3.5">
          <p className="text-sm font-medium text-foreground">
            {t("duplicate.reviewed")}: {t(`duplicate.verdict.${data.verdict}`)}
          </p>
          {data.verdictNote && (
            <p className="mt-1 text-sm text-muted-foreground">{data.verdictNote}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {data.reviewedByName} · {formatDateTime(data.reviewedAt)}
          </p>
        </div>
      ) : canReview ? (
        <div className="rounded-lg border border-border p-3.5">
          <p className="mb-2 text-sm font-medium text-foreground">{t("duplicate.reviewTitle")}</p>
          <p className="mb-3 text-xs text-muted-foreground">{t("duplicate.reviewHint")}</p>

          <div className="space-y-3">
            <Select value={verdict} onValueChange={(v) => setVerdict(v as DuplicateVerdict)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("duplicate.verdictPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {DUPLICATE_VERDICTS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`duplicate.verdict.${v}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {verdict && verdict !== "NOT_DUPLICATE" && (
              <div>
                <label htmlFor="dup-note" className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("duplicate.noteLabel")} <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="dup-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("duplicate.notePlaceholder")}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={!verdict || noteMissing || reviewMutation.isPending}
                onClick={() =>
                  verdict &&
                  reviewMutation.mutate({ verdict, note: note.trim() || undefined })
                }
              >
                {reviewMutation.isPending && <Loader2 className="animate-spin" />}
                {t("duplicate.saveVerdict")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MatchRow({ match }: { match: DuplicateMatch }) {
  const { t } = useTranslation();
  const isFlagged = match.severity !== "LOW";

  return (
    <li
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 rounded-lg border p-3",
        match.severity === "HIGH"
          ? "border-destructive/40 bg-destructive/5"
          : match.severity === "WARN"
            ? "border-warning/50 bg-warning/5"
            : "border-border"
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{match.titleVi}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {match.projectCode && <span>{match.projectCode}</span>}
          {match.piName && <span>· {match.piName}</span>}
          {match.cycleYear && <span>· {match.cycleYear}</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Điểm hiện nguyên số chứ không quy ra "phần trăm giống nhau": cosine không phải tỷ lệ
            câu chữ trùng, gọi là phần trăm là mô tả sai thứ đang đo. */}
        <span className="font-mono text-sm tabular-nums text-foreground">
          {match.similarity.toFixed(3)}
        </span>
        {isFlagged ? (
          <Badge variant={match.severity === "HIGH" ? "destructive" : "secondary"}>
            {t(`duplicate.severity.${match.severity}`)}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <CircleHelp className="size-3" />
            {t("duplicate.severity.LOW")}
          </Badge>
        )}
      </div>
    </li>
  );
}
