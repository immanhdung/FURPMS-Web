import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Check, FilePenLine, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { usePendingAmendmentsQuery, useReviewPendingAmendmentMutation } from "@/hooks/useAmendments";
import { formatDate } from "@/utils/format";
import type { PendingAmendment } from "@/types/amendment";

/**
 * Đơn đề nghị điều chỉnh (BM07, QĐ543 Điều 10.2) đang chờ Phòng QLKH duyệt — của MỌI hợp đồng.
 *
 * <p><b>Vì sao (01/10).</b> Trước đây PI có HAI đường xin thay đổi: "Yêu cầu thay đổi" trong trang
 * đề cương (5 loại, Staff duyệt xong KHÔNG có tác dụng gì) và "Điều chỉnh hợp đồng" (BM07, gia hạn
 * được tự cộng vào hạn hợp đồng). Menu "Yêu cầu thay đổi" của Staff lại trỏ vào đường thứ nhất, còn
 * đơn BM07 thật chỉ nằm sâu trong tab "Điều chỉnh" của từng hợp đồng — PI gửi xong không ai hay.
 * Nay chỉ còn một đường (BM07) và Staff duyệt ngay tại đây.</p>
 */
export function PendingAmendmentsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = usePendingAmendmentsQuery();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <FilePenLine className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("pendingAmendments.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("pendingAmendments.subtitle")}</p>
        </div>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={FilePenLine}
          title={t("pendingAmendments.empty")}
          description={t("pendingAmendments.emptyDesc")}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((a) => (
            <PendingAmendmentCard key={a.id} amendment={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PendingAmendmentCard({ amendment: a }: { amendment: PendingAmendment }) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const review = useReviewPendingAmendmentMutation();
  const busy = review.isPending;
  const isExtension = a.categoryCode === "EXTENSION";

  return (
    <li className="space-y-3 rounded-xl border border-border bg-card/95 p-4 shadow-soft-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{a.projectTitle ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {t("reports.contractNo", { no: a.contractNumber ?? "—" })} · {t("pendingAmendments.pi")}: {a.piName ?? "—"} ·{" "}
            {t("pendingAmendments.sentOn", { date: formatDate(a.requestedAt) })}
          </p>
        </div>
        <Badge variant="secondary">{a.categoryName ?? a.categoryCode}</Badge>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-foreground">{a.changeDescription}</p>
        {isExtension && a.newValue && (
          <p className="text-xs font-medium text-primary">
            {t("pendingAmendments.extensionAsk", { n: a.newValue })}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t("pendingAmendments.why")}: {a.justification}
        </p>
      </div>

      <Textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("pendingAmendments.commentPlaceholder")}
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={busy || !comment.trim()}
          title={!comment.trim() ? t("pendingAmendments.rejectNeedsReason") : undefined}
          onClick={() => review.mutate({ id: a.id, approve: false, reviewerComments: comment.trim() })}
        >
          {busy ? <Loader2 className="animate-spin" /> : <X />}
          {t("common.reject")}
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={() => review.mutate({ id: a.id, approve: true, reviewerComments: comment.trim() || undefined })}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Check />}
          {isExtension ? t("pendingAmendments.approveExtension") : t("common.approve")}
        </Button>
      </div>
    </li>
  );
}
