import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  open: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  accepted: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  planning: "bg-warning/10 text-warning",
  pending: "bg-warning/10 text-warning",
  invited: "bg-warning/10 text-warning",
  inactive: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
  rejected: "bg-danger/10 text-danger",
  declined: "bg-danger/10 text-danger",
};

const DOT_STYLES: Record<string, string> = {
  active: "bg-success",
  open: "bg-success",
  approved: "bg-success",
  accepted: "bg-success",
  confirmed: "bg-success",
  planning: "bg-warning",
  pending: "bg-warning",
  invited: "bg-warning",
  inactive: "bg-muted-foreground",
  closed: "bg-muted-foreground",
  rejected: "bg-danger",
  declined: "bg-danger",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] ?? "bg-muted text-muted-foreground";
  const dot = DOT_STYLES[key] ?? "bg-muted-foreground";

  /**
   * Trước đây render THẲNG giá trị enum của BE, nên giao diện tiếng Việt vẫn hiện "PASSED",
   * "IN_PROGRESS", "PENDING_SIGNATURE"… (thầy bắt lúc demo 05/08: "bên tiếng Việt phải full
   * tiếng Việt, có chỗ để là passed"). Nay tra bảng `status.*`; key nào chưa có thì vẫn hiện
   * enum để lộ ra mà bổ sung, chứ không hiện trống.
   */
  const label = t(`status.${status.toUpperCase()}`, { defaultValue: status });

  return (
    <Badge variant="secondary" className={cn("gap-1.5 font-medium", style)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      {label}
    </Badge>
  );
}
