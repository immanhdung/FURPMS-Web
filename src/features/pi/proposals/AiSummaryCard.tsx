import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProposalSummaryQuery,
  useReviewKitMutation,
  useSummarizeProposalMutation,
} from "@/hooks/useProposalAi";
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
  /**
   * Có hội đồng ⇒ chạy **bộ gộp**: một lần bấm ra cả tóm tắt lẫn gợi ý điểm.
   *
   * Trước đây người chấm phải bấm "Tóm tắt" chờ 30–60 giây, đọc xong bấm tiếp "Gợi ý điểm" chờ
   * thêm lượt nữa — đúng lúc hội đồng đang ngồi nhìn. Gói Gemini miễn phí lại giới hạn request
   * mỗi phút nên bấm hai lần liên tiếp rất dễ bị chặn giữa buổi họp.
   */
  councilId,
}: {
  proposalId: string;
  autoGenerate?: boolean;
  councilId?: string;
}) {
  const { t } = useTranslation();
  const { data: cached, isLoading } = useProposalSummaryQuery(proposalId);
  const summarizeMutation = useSummarizeProposalMutation();
  const reviewKitMutation = useReviewKitMutation(councilId ?? "");

  const isCouncilMode = Boolean(councilId);
  const isWorking = isCouncilMode ? reviewKitMutation.isPending : summarizeMutation.isPending;
  const run = () =>
    isCouncilMode ? reviewKitMutation.mutate(proposalId) : summarizeMutation.mutate(proposalId);

  const summary = reviewKitMutation.data?.summary ?? summarizeMutation.data ?? cached ?? null;

  /**
   * Thầy 05/08: *"phần tạo tóm tắt AI phải tự động chạy trước khi vào page chấm điểm, không cần
   * bấm button Tạo AI"*. Chỉ bật ở màn người chấm — màn PI vẫn để họ tự bấm, tránh gọi Gemini
   * mỗi lần mở đề cương của mình.
   */
  const triggered = useRef(false);
  useEffect(() => {
    if (!autoGenerate || isLoading || cached || triggered.current) return;
    triggered.current = true;
    run();
    // Chỉ chạy MỘT lần cho mỗi đề cương; `run` đổi tham chiếu mỗi lần render nên không đưa vào deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, isLoading, cached, proposalId]);
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
            <CardTitle className="text-sm">
              {isCouncilMode ? t("proposal.aiReviewKit") : t("proposal.aiSummary")}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={run} disabled={isWorking}>
            {isWorking ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isCouncilMode
              ? text
                ? t("proposal.aiReviewKitAgain")
                : t("proposal.aiReviewKitRun")
              : text
                ? t("proposal.regenerate")
                : t("proposal.generate")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isWorking ? (
          /* AI đọc file rồi mới tóm tắt nên mất 30–60 giây. Chỉ hiện khung xám thì trông như treo —
             lúc demo là người xem tưởng hỏng. Nói thẳng đang làm gì và mất bao lâu. */
          <div className="space-y-2">
            {isWorking && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {isCouncilMode ? t("proposal.aiReviewKitWorking") : t("proposal.aiSummaryWorking")}
              </p>
            )}
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : text ? (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {/*
              ĐOẠN TÓM TẮT ĐÃ BỎ KHỎI MÀN (17/08) — chỉ giữ Ưu điểm / Nhược điểm.

              Ngay cạnh thẻ này là tab "Thông tin đề tài" với đầy đủ mục tiêu, phương pháp, sản
              phẩm dự kiến do chủ nhiệm nhập. Đoạn tóm tắt chỉ diễn đạt lại đúng những thứ đó bằng
              văn xuôi — người chấm đọc hai lần cùng một nội dung, mà bản của máy còn kém tin cậy
              hơn bản gốc. Phần thực sự thêm giá trị là ưu/nhược: đó là NHẬN ĐỊNH, và là chỗ AI
              đối chiếu file đính kèm với biểu mẫu rồi chỉ ra điểm vênh.

              `summaryText` vẫn được sinh và lưu ở máy chủ (biên bản/xuất Word còn dùng), chỉ là
              không bày ở đây nữa.
            */}
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
