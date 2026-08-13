import dayjs from "dayjs";
import i18n from "@/i18n";

/**
 * Ngày tháng dùng dạng SỐ `DD/MM/YYYY`, không dùng `DD MMM YYYY`.
 *
 * `MMM` lấy tên tháng theo locale của dayjs, mà locale mặc định là `en` và dự án chưa bao giờ đặt
 * sang `vi` — nên mọi màn tiếng Việt đều hiện "12 Aug 2026", "01 Mar 2026". Đặt locale `vi` thì ra
 * "12 thg 8 2026", đọc cũng gượng. Dạng số là chuẩn hành chính Việt Nam (Nghị định 30/2020 ghi
 * ngày/tháng/năm) và không phụ thuộc locale nào cả.
 */
const DATE_PATTERN = "DD/MM/YYYY";

export function formatDate(value: string | Date | undefined | null, pattern = DATE_PATTERN): string {
  if (!value) return "-";
  return dayjs(value).format(pattern);
}

export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) return "-";
  return dayjs(value).format(`${DATE_PATTERN} HH:mm`);
}

/**
 * "3 phút trước", "2 ngày trước"…
 *
 * Trước đây trả chuỗi tiếng Anh CỨNG ("just now", "5m ago") — không qua bảng dịch nên không đợt
 * rà tiếng Việt nào phát hiện ra, mà nó hiện ngay trên chuông thông báo.
 */
export function formatRelativeTime(value: string | Date | undefined | null): string {
  if (!value) return "-";
  const target = dayjs(value);

  const diffMinutes = dayjs().diff(target, "minute");
  if (diffMinutes < 1) return i18n.t("time.justNow");
  if (diffMinutes < 60) return i18n.t("time.minutesAgo", { n: diffMinutes });

  const diffHours = dayjs().diff(target, "hour");
  if (diffHours < 24) return i18n.t("time.hoursAgo", { n: diffHours });

  const diffDays = dayjs().diff(target, "day");
  if (diffDays < 30) return i18n.t("time.daysAgo", { n: diffDays });

  return target.format(DATE_PATTERN);
}

export function formatCurrency(value: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(value);
}
