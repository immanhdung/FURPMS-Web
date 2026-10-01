import { useTranslation } from "react-i18next";
import { CalendarRange } from "lucide-react";
import { formatDate } from "@/utils/format";

/** Ngày dạng yyyy-MM-dd tính theo UTC — tránh lệch một ngày theo múi giờ máy. */
const toUtc = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const DAY = 864e5;

export interface PlannedRound {
  round: number;
  start: string;
  end: string;
}

/**
 * Chia đều thời gian hợp đồng thành N kỳ — ĐÚNG phép tính của máy chủ
 * (`ProgressReportService.GenerateScheduledRoundsAsync`): mỗi kỳ dài `tổng ngày / N`, kỳ cuối kết thúc
 * đúng ngày kết thúc hợp đồng, hạn nộp = ngày cuối kỳ. Tính lại ở đây để XEM TRƯỚC, không thay máy chủ.
 */
export function planProgressRounds(startIso: string, endIso: string, count: number): PlannedRound[] {
  const start = toUtc(startIso);
  let end = toUtc(endIso);
  if (end <= start) end = toUtc(fromUtc(start)) + 182 * DAY; // máy chủ lùi về 6 tháng khi ngày hỏng
  const totalDays = Math.round((end - start) / DAY);
  const chunk = count > 0 ? Math.floor(totalDays / count) : totalDays;
  return Array.from({ length: count }, (_, i) => ({
    round: i + 1,
    start: fromUtc(start + chunk * i * DAY),
    end: fromUtc(i + 1 === count ? end : start + chunk * (i + 1) * DAY),
  }));
}

/**
 * Khung giải thích lịch báo cáo tiến độ TRƯỚC khi bấm tạo (01/10).
 *
 * <p>Trước đây chỉ có ô số kỳ + nút "Tạo kỳ báo cáo định kỳ": người dùng không biết hệ thống sẽ đặt hạn
 * ngày nào, nên tự chọn ngày đại khi sửa lịch. Nay hiện rõ: hợp đồng chạy từ đâu tới đâu, mặc định mấy kỳ
 * theo QĐ543 Điều 10.1, và mỗi kỳ hạn ngày nào.</p>
 */
export function ProgressSchedulePreview({
  startDate,
  endDate,
  count,
  isDefault,
  existingRounds,
}: {
  startDate?: string | null;
  endDate?: string | null;
  count: number;
  isDefault: boolean;
  existingRounds: number[];
}) {
  const { t } = useTranslation();
  if (!startDate || !endDate || count < 1) return null;

  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);
  const months = Math.max(1, Math.round((toUtc(end) - toUtc(start)) / DAY / 30.44));
  const plan = planProgressRounds(start, end, count);

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <p className="flex items-start gap-2 text-sm text-foreground">
        <CalendarRange className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          {t("reports.preview.contractSpan", { start: formatDate(start), end: formatDate(end), months })}{" "}
          {isDefault
            ? t("reports.preview.defaultCount", { n: count })
            : t("reports.preview.customCount", { n: count })}
        </span>
      </p>
      <ol className="space-y-1 pl-6 text-xs text-muted-foreground">
        {plan.map((p) => (
          <li key={p.round} className="tabular-nums">
            <span className="font-medium text-foreground">{t("reports.roundN", { n: p.round })}</span>
            {" · "}
            {t("reports.preview.period", { start: formatDate(p.start), end: formatDate(p.end) })}
            {" · "}
            <span className="text-foreground">{t("reports.preview.due", { date: formatDate(p.end) })}</span>
            {existingRounds.includes(p.round) && ` · ${t("reports.preview.alreadyCreated")}`}
          </li>
        ))}
      </ol>
      <p className="pl-6 text-xs text-muted-foreground">{t("reports.preview.note")}</p>
    </div>
  );
}
