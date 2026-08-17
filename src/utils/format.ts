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
 * Chuẩn hoá link người dùng gõ tay thành URL đi ra NGOÀI được.
 *
 * Staff gõ link họp kiểu `"meet.google.com/abc-defg"` hay `"fb.com"` — không có `https://`.
 * Trình duyệt hiểu chuỗi không có scheme là **đường dẫn TƯƠNG ĐỐI**, nên `<a href="fb.com">` từ
 * trang `/assigned-reviews` sẽ nhảy tới `localhost:5173/assigned-reviews/fb.com` — trang trắng,
 * không ai hiểu vì sao "Vào họp" lại đi lạc.
 *
 * Trả `undefined` khi không có gì để mở, để nơi gọi tự ẩn nút thay vì bày một link chết.
 */
export function externalUrl(value: string | undefined | null): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  // Giữ nguyên nếu đã có scheme (http, https, và cả mailto:/tel: nếu ai đó dán vào).
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return `https://${v.replace(/^\/+/, "")}`;
}

/**
 * Tên đề tài để hiển thị — **tiếng Việt luôn thắng**.
 *
 * QĐ543 là quy định tiếng Việt và `titleVI` là trường bắt buộc; `titleEN` chỉ nộp "trong trường
 * hợp cần thiết" (Điều 6.4.a). Trước 17/08 các màn không thống nhất: đề tài của tôi / chi tiết
 * đề cương lấy `titleVI` trước, còn hợp đồng / bảng vòng chấm / workspace lại lấy `titleEN`
 * trước — cùng một đề tài, đi qua hai màn ra hai cái tên. Gom về một hàm để không lệch lại.
 */
export function proposalTitle(
  source: { titleVI?: string | null; titleEN?: string | null } | null | undefined,
  fallback = ""
): string {
  return source?.titleVI?.trim() || source?.titleEN?.trim() || fallback;
}

/**
 * Cầu nối giữa ô `<input type="datetime-local">` và API.
 *
 * Ô này **không có khái niệm múi giờ**: nó cho ra `"2026-08-26T11:04"`, còn API lưu mốc UTC thật.
 * Trước 17/08 hai bên nối thẳng vào nhau nên sai cả hai chiều:
 * - **Gửi đi:** đẩy nguyên chuỗi không múi giờ → Npgsql từ chối ghi vào cột `timestamptz` →
 *   toàn bộ endpoint đặt lịch trả **500**, giao diện chỉ báo "sự cố ngoài dự kiến".
 * - **Nhận về:** `slice(0, 16)` cắt chuỗi UTC rồi nhét thẳng vào ô → mở form sửa thấy giờ lệch
 *   đúng bằng chênh múi giờ (Việt Nam là 7 tiếng), lưu lại thì lệch thêm 7 tiếng nữa.
 *
 * Hai hàm dưới quy đổi đúng chiều, khớp với `formatDateTime` (dayjs cũng hiện theo giờ máy).
 */
export function toDateTimeLocalInput(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM-DDTHH:mm") : "";
}

/** `"2026-08-26T11:04"` (giờ máy người dùng) → `"2026-08-26T04:04:00.000Z"`. */
export function fromDateTimeLocalInput(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const d = dayjs(value);
  return d.isValid() ? d.toDate().toISOString() : undefined;
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
