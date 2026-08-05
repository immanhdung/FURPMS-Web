import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProposalSummaryQuery, useSummarizeProposalMutation } from "@/hooks/useProposalAi";
import { formatDateTime } from "@/utils/format";

/**
 * Tóm tắt AI của đề cương.
 *
 * Dùng ở CẢ màn PI lẫn màn chấm của reviewer — người cần bản tóm tắt nhất chính là
 * **người chấm** (đọc nhiều đề tài, thời gian ngắn), trước đây card này chỉ có ở màn PI.
 *
 * Mở màn là đọc bản đã sinh sẵn (cache `llm_outputs`, không tốn quota Gemini);
 * chưa có mới hiện nút tạo.
 */
export function AiSummaryCard({
  proposalId,
  /** Tự sinh tóm tắt khi chưa có — dùng ở màn CHẤM ĐIỂM để reviewer mở ra là có ngay. */
  autoGenerate = false,
}: {
  proposalId: string;
  autoGenerate?: boolean;
}) {
  const { t } = useTranslation();
  const { data: cached, isLoading } = useProposalSummaryQuery(proposalId);
  const summarizeMutation = useSummarizeProposalMutation();

  const summary = summarizeMutation.data ?? cached ?? null;

  /**
   * Thầy 05/08: *"phần tạo tóm tắt AI phải tự động chạy trước khi vào page chấm điểm, không cần
   * bấm button Tạo AI"*. Chỉ bật ở màn người chấm — màn PI vẫn để họ tự bấm, tránh gọi Gemini
   * mỗi lần mở đề cương của mình.
   */
  const triggered = useRef(false);
  useEffect(() => {
    if (!autoGenerate || isLoading || cached || triggered.current) return;
    triggered.current = true;
    summarizeMutation.mutate(proposalId);
  }, [autoGenerate, isLoading, cached, proposalId, summarizeMutation]);
  // Bản người sửa tay được ưu tiên hơn bản AI viết (PATCH /proposals/{id}/summary).
  const text = summary?.editedText?.trim() || summary?.summaryText?.trim() || "";

  return (
    <Card variant="glass" className="border-primary/15">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-primary to-brand-secondary text-white">
              <Sparkles className="size-3.5" />
            </div>
            <CardTitle className="text-sm">{t("proposal.aiSummary")}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => summarizeMutation.mutate(proposalId)}
            disabled={summarizeMutation.isPending}
          >
            {summarizeMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {text ? t("proposal.regenerate") : t("proposal.generate")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || summarizeMutation.isPending ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : text ? (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {summary?.title && (
              <p className="text-sm font-medium text-foreground">{summary.title}</p>
            )}
            <p className="whitespace-pre-line text-sm text-foreground">{text}</p>

            {/* Prompt v2 tách ưu/nhược — hội đồng cần thấy ngay điểm mạnh yếu, không phải đọc
                một khối văn xuôi rồi tự rút ra. */}
            {summary?.strengths && summary.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-success">{t("proposal.aiStrengths")}</p>
                <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-foreground">
                  {summary.strengths.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}
            {summary?.weaknesses && summary.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-warning">{t("proposal.aiWeaknesses")}</p>
                <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-foreground">
                  {summary.weaknesses.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}

            {/* Nói rõ AI đã đọc file hay chỉ đọc form — hai bản chất lượng khác hẳn nhau. */}
            <p className="text-[11px] text-muted-foreground">
              {summary?.source === "file+form"
                ? t("proposal.aiSourceFile", { name: summary?.sourceFileName ?? "" })
                : t("proposal.aiSourceForm")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {summary?.isEditedByHuman
                ? t("proposal.aiSummaryEdited")
                : t("proposal.aiSummaryGeneratedAt", { date: formatDateTime(summary?.generatedAt) })}
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("proposal.aiSummaryDesc")}</p>
        )}
      </CardContent>
    </Card>
  );
}
