import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDeadlineExtensionsQuery, useExtendDeadlineMutation } from "@/hooks/useCycles";
import { formatDate } from "@/utils/format";
import type { Cycle } from "@/types/cycle";

/** Gia hạn deadline đợt (rule tuần 10) — ghi log, KHÔNG ghi đè ngày gốc; hiệu lực = bản mới nhất. */
export function ExtendDeadlineDialog({
  open,
  onOpenChange,
  cycle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: Cycle | null;
}) {
  const { t } = useTranslation();
  const mutation = useExtendDeadlineMutation(cycle?.id ?? 0);
  const { data: history } = useDeadlineExtensionsQuery(open ? (cycle?.id ?? null) : null);
  const [newDeadline, setNewDeadline] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setNewDeadline("");
      setReason("");
    }
  }, [open]);

  // Deadline hiệu lực hiện tại = bản gia hạn mới nhất, hoặc ngày gốc của đợt.
  const effective = history && history.length > 0 ? history[0].newDeadline : cycle?.submissionDeadline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("cycles.extendTitle")}</DialogTitle>
          <DialogDescription>{t("cycles.extendDesc", { date: formatDate(effective) })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label htmlFor="new-deadline" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("cycles.newDeadline")} <span className="text-destructive">*</span>
            </label>
            <Input id="new-deadline" type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
          </div>
          <div>
            <label htmlFor="extend-reason" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("cycles.extendReason")}
            </label>
            <Textarea id="extend-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          {history && history.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("cycles.extendHistory")}</p>
              <ul className="space-y-1">
                {history.map((h) => (
                  <li key={h.id} className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">
                    {formatDate(h.oldDeadline)} → <span className="font-medium text-foreground">{formatDate(h.newDeadline)}</span>
                    {h.reason ? ` · ${h.reason}` : ""} · {formatDate(h.createdAt)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!newDeadline || mutation.isPending}
            onClick={() =>
              cycle &&
              mutation.mutate(
                { newDeadline, reason: reason.trim() || undefined },
                { onSuccess: () => onOpenChange(false) }
              )
            }
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {t("cycles.extendBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
