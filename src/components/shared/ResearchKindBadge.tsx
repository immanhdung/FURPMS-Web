import { useTranslation } from "react-i18next";
import { FlaskConical, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Đề tài này hệ thống đang hiểu là CƠ BẢN hay ỨNG DỤNG — và hệ quả theo QĐ543 (số kỳ tiến độ, số đợt giải
 * ngân). 03/10: trước đây không màn nào nói ra, nên một loại "Ứng dụng" bị phân loại nhầm thành Cơ bản chỉ
 * lộ ra khi thấy 1 kỳ tiến độ / 1 đợt giải ngân — người test không biết đề tài đang chạy luồng nào.
 */
export function ResearchKindBadge({
  isApplied,
  detailed = true,
  className,
}: {
  isApplied: boolean;
  /** Kèm "2 kỳ tiến độ · 4 đợt giải ngân". */
  detailed?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const Icon = isApplied ? Factory : FlaskConical;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        isApplied ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-foreground",
        className
      )}
    >
      <Icon className="size-3" />
      {t(isApplied ? "researchKind.applied" : "researchKind.basic")}
      {detailed && (
        <span className="font-normal text-muted-foreground">
          · {t(isApplied ? "researchKind.appliedDetail" : "researchKind.basicDetail")}
        </span>
      )}
    </span>
  );
}
