import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

/**
 * Nhãn hạn dùng chung: "còn N ngày" / "quá hạn N ngày" (đỏ) / "chưa đặt hạn" (xám).
 *
 * <p><b>Vì sao rút ra dùng chung (25/08):</b> trước đó chỉ đúng MỘT chỗ trong app biết đếm ngược
 * (`OpenCyclesCard`), mọi màn còn lại chỉ in ngày ra — nên **hạn đã qua nhìn y hệt hạn còn xa**.
 * Hội đồng bảo vệ lần 2 yêu cầu thể hiện rõ mốc thời gian từng giai đoạn, mà "rõ" nghĩa là nhìn
 * phát biết còn kịp hay không, chứ không phải đọc ngày rồi tự nhẩm.</p>
 *
 * <p><b>`daysLeft` nên do MÁY CHỦ tính</b> chứ không tính lại ở đây: máy chủ dùng đồng hồ hệ thống
 * (có công cụ tua thời gian để test các mốc), còn `Date.now()` của trình duyệt là giờ máy người
 * dùng — hai bên lệch nhau là badge nói một đằng, email nhắc một nẻo. Vì vậy badge <b>nhận</b>
 * `daysLeft` chứ không tự tính: gọi từ đâu thì chỗ đó chịu trách nhiệm về con số.</p>
 *
 * <p>Đã từng có một bản tính `daysUntil()` phía trình duyệt cho các endpoint danh sách chưa trả
 * `daysLeft`. Bỏ rồi: thẻ "Hạn sắp tới" hiện *"Còn 7 ngày"* trong khi tab Sản phẩm hiện
 * *"Còn 6 ngày"* cho **cùng một sản phẩm** — máy chủ chạy UTC, máy người dùng UTC+7. Nay mọi
 * endpoint có hạn đều trả `daysLeft` (xem `DeadlineMath` bên BE).</p>
 */
export function DeadlineBadge({
  deadline,
  daysLeft,
  basis,
  isExtended,
  className,
}: {
  deadline?: string | null;
  /** Số ngày còn lại do BE tính; âm = đã quá hạn. */
  daysLeft?: number | null;
  /** Căn cứ của hạn — hiện ở tooltip để trả lời ngay câu "hạn này ở đâu ra". */
  basis?: string | null;
  isExtended?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  if (!deadline) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)} title={basis ?? undefined}>
        {t("deadline.notSet")}
      </Badge>
    );
  }

  const label =
    daysLeft == null
      ? formatDate(deadline)
      : daysLeft < 0
        ? t("deadline.overdueBy", { n: Math.abs(daysLeft) })
        : t("deadline.daysLeft", { n: daysLeft });

  // Ba mức: quá hạn (đỏ) · còn ≤7 ngày (vàng) · còn xa (viền thường).
  const variant = daysLeft != null && daysLeft < 0 ? "destructive" : "outline";
  const atRisk = daysLeft != null && daysLeft >= 0 && daysLeft <= 7;

  // Tooltip luôn có NGÀY cụ thể — badge nói "còn 3 ngày" mà không nói ngày nào thì vẫn phải đi tra.
  const title = [formatDate(deadline), basis].filter(Boolean).join(" — ");

  return (
    <Badge
      variant={variant}
      title={title}
      className={cn(atRisk && "border-warning/50 bg-warning/10 text-warning", className)}
    >
      {label}
      {isExtended && <span className="ml-1 opacity-70">{t("deadline.extendedMark")}</span>}
    </Badge>
  );
}
