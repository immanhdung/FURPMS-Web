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

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? "bg-muted text-muted-foreground";

  return (
    <Badge variant="secondary" className={cn("font-medium", style)}>
      {status}
    </Badge>
  );
}
