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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const [pickId, setPickId] = useState<string | undefined>();

  const attachedIds = useMemo(() => new Set((attached ?? []).map((tk) => tk.id)), [attached]);
  const available = (allTracks ?? []).filter((tk) => !attachedIds.has(tk.id));
  const busy = attachMutation.isPending || detachMutation.isPending;

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
              <div className="flex items-center gap-2">
                <Select value={pickId} onValueChange={setPickId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("cycles.selectFieldToAttach")} />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((tk) => (
                      <SelectItem key={tk.id} value={tk.id.toString()}>
                        {tk.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  disabled={!pickId || busy}
                  onClick={() =>
                    pickId &&
                    cycleId &&
                    attachMutation.mutate(Number(pickId), { onSuccess: () => setPickId(undefined) })
                  }
                >
                  {attachMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  {t("cycles.attachBtn")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
