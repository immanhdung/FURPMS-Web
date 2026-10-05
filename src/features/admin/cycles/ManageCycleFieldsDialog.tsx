import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTracksQuery, useTracksByCycleQuery, useAttachTrackToCycleMutation, useDetachTrackFromCycleMutation } from "@/hooks/useTracks";
import type { Cycle } from "@/types/cycle";

interface ManageCycleFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: Cycle | null;
}

/**
 * Quản lý lĩnh vực CỦA 1 ĐỢT: đợt tự chọn (gắn/gỡ) lĩnh vực nó mở — dùng lại lĩnh vực global.
 * Đợt 1 có thể mở AI+IT, đợt 2 chỉ mở AI (gỡ IT). PI chỉ chọn được lĩnh vực đã gắn vào đợt.
 */
export function ManageCycleFieldsDialog({ open, onOpenChange, cycle }: ManageCycleFieldsDialogProps) {
  const { t } = useTranslation();
  const cycleId = cycle?.id;
  const { data: allTracks } = useTracksQuery();
  const { data: attached } = useTracksByCycleQuery(cycleId);
  const attachMutation = useAttachTrackToCycleMutation(cycleId ?? 0);
  const detachMutation = useDetachTrackFromCycleMutation(cycleId ?? 0);

  // E1: chọn NHIỀU lĩnh vực rồi gắn một lượt. Trước đây mỗi lần chỉ chọn được 1 rồi bấm "Gắn",
  // đợt mở 4 lĩnh vực là lặp 4 vòng — thao tác thừa mà không có lý do nghiệp vụ nào.
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [attaching, setAttaching] = useState(false);

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Gắn TUẦN TỰ: mỗi lĩnh vực là một yêu cầu riêng, bắn song song thì lỗi ở giữa khó truy.
  const attachPicked = async () => {
    if (!cycleId || picked.size === 0) return;
    setAttaching(true);
    try {
      for (const id of picked) {
        await attachMutation.mutateAsync(id);
      }
      setPicked(new Set());
    } finally {
      setAttaching(false);
    }
  };

  const attachedIds = useMemo(() => new Set((attached ?? []).map((tk) => tk.id)), [attached]);
  const available = (allTracks ?? []).filter((tk) => !attachedIds.has(tk.id));
  const busy = attaching || detachMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("cycles.manageFieldsTitle", { name: cycle?.name ?? "" })}</DialogTitle>
          <DialogDescription>{t("cycles.manageFieldsDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lĩnh vực đã gắn */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("cycles.attachedFields")}</p>
            {(attached?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">{t("cycles.noAttachedFields")}</p>
            ) : (
              <ul className="space-y-1.5">
                {attached?.map((tk) => (
                  <li key={tk.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{tk.name}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("common.remove")}
                      disabled={busy}
                      onClick={() => cycleId && detachMutation.mutate(tk.id)}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Gắn thêm lĩnh vực */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("cycles.attachField")}</p>
            {available.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("cycles.noAvailableFields")}</p>
            ) : (
              <div className="space-y-2">
                <ul className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {available.map((tk) => (
                    <li key={tk.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60">
                        <Checkbox
                          checked={picked.has(tk.id)}
                          onCheckedChange={() => toggle(tk.id)}
                          disabled={busy}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{tk.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <Button type="button" disabled={picked.size === 0 || busy} onClick={attachPicked}>
                  {attaching ? <Loader2 className="animate-spin" /> : <Plus />}
                  {picked.size > 1
                    ? t("cycles.attachManyBtn", { count: picked.size })
                    : t("cycles.attachBtn")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
