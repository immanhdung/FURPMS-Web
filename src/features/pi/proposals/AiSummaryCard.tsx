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
export function AiSummaryCard({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation();
  const { data: cached, isLoading } = useProposalSummaryQuery(proposalId);
  const summarizeMutation = useSummarizeProposalMutation();

  const summary = summarizeMutation.data ?? cached ?? null;
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
            <p className="whitespace-pre-line text-sm text-foreground">{text}</p>
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
