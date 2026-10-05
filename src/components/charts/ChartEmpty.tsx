import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";

/**
 * Hiện khi biểu đồ **không có dữ liệu nào để vẽ**.
 *
 * <p>
 * Trước đây thân biểu đồ rỗng thì Recharts vẽ ra một khung **trắng trơn** — không chữ, không viền,
 * không gì cả. Trên bản deploy sạch (chưa có đề tài nào) thì bảng điều khiển là màn đầu tiên người
 * ta thấy, và hai ô trắng giữa trang trông y như hệ thống hỏng. Nói thẳng "chưa có dữ liệu" thì
 * người xem biết là bình thường, chỉ là chưa ai nhập gì.
 * </p>
 */
export function ChartEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <BarChart3 className="size-8 opacity-40" />
      <p className="text-sm">{t("common.noChartData")}</p>
    </div>
  );
}
