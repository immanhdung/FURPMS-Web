import { useTranslation } from "react-i18next";
import { AlertTriangle, CircleCheck, Sparkles } from "lucide-react";
import { useDuplicateCheckQuery } from "@/hooks/useDuplicateCheck";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

/**
 * Kết luận rà trùng lặp — thẻ CỐ ĐỊNH trên trang chi tiết đề cương của chủ nhiệm.
 *
 * <p><b>Vì sao cần thêm (26/08, sau khi chủ dự án bấm thử và không thấy gì):</b> trước đó kết luận
 * chỉ tới PI qua một dòng thông báo trong chuông — thoáng qua, gạt đi là mất, và không có chỗ nào
 * để quay lại xem sau. Panel đầy đủ (<c>DuplicateCheckPanel</c>) thì chỉ nằm ở màn của Phòng QLKH.
 * Đây là bản RÚT GỌN, chỉ đọc, đặt ngay dưới dòng thời gian trạng thái — chỗ đầu tiên PI nhìn vào
 * khi mở lại đề cương của mình.</p>
 *
 * <p>Cố ý KHÔNG hiện danh sách các đề tài giống (tên, chủ nhiệm của đề tài khác) — đó là dữ liệu để
 * Phòng QLKH đối chiếu nội bộ, hiện ra cho PI thành ra so sánh chéo giữa các chủ nhiệm với nhau.
 * PI cần biết KẾT LUẬN và CĂN CỨ, không cần biết "giống với đề tài của ai".</p>
 *
 * <p>Chưa có kết luận (Phòng QLKH chưa xem, hoặc chưa vượt ngưỡng nào) thì KHÔNG hiện gì cả — im
 * lặng đúng nghĩa "chưa có gì để nói", không phải một ô trống đáng ngờ.</p>
 */
export function DuplicateVerdictCard({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation();
  const { data } = useDuplicateCheckQuery(proposalId);

  if (!data?.verdict) return null;

  const isClear = data.verdict === "NOT_DUPLICATE";

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isClear ? "border-success/40 bg-success/5" : "border-warning bg-warning/10"
      )}
    >
      <p className="flex items-start gap-2 text-sm font-medium text-foreground">
        {isClear ? (
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        )}
        <span>
          {t("myProposal.duplicateVerdictTitle")}: {t(`duplicate.verdict.${data.verdict}`)}
        </span>
      </p>

      {data.verdictNote && (
        <p className="mt-1.5 pl-6 text-sm text-foreground">{data.verdictNote}</p>
      )}

      {/* AI viết ra để PI đọc, không phải để hệ thống hành động theo — cùng nguyên tắc với panel
          của Phòng QLKH. Chỉ hiện khi kết luận CÓ vấn đề: nếu đã "không trùng lặp" thì phần giải
          thích trùng ở đâu không còn giá trị đọc. */}
      {!isClear && data.explanation && (
        <p className="mt-2 flex items-start gap-1.5 pl-6 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 size-3 shrink-0" />
          <span className="whitespace-pre-wrap">{data.explanation}</span>
        </p>
      )}

      <p className="mt-2 pl-6 text-xs text-muted-foreground">
        {data.reviewedByName} · {formatDateTime(data.reviewedAt)}
      </p>
    </div>
  );
}
