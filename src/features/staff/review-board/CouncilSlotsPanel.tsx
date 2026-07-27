import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCouncilSlotsQuery, useSaveSlotsMutation } from "@/hooks/useCouncilSlots";

interface Row {
  projectId: string;
  projectTitle: string;
  start: string; // datetime-local (YYYY-MM-DDTHH:mm)
  duration: number;
}

/** Lịch chấm (rule tuần 10): gán khung giờ con cho từng đề tài trong buổi họp của hội đồng. */
export function CouncilSlotsPanel({ councilId }: { councilId: string }) {
  const { t } = useTranslation();
  const { data: slots } = useCouncilSlotsQuery(councilId);
  const save = useSaveSlotsMutation(councilId);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (slots && loadedId !== councilId) {
    setLoadedId(councilId);
    setRows(
      slots.map((s) => ({
        projectId: s.projectId,
        projectTitle: s.projectTitle,
        start: s.slotStartAt ? s.slotStartAt.slice(0, 16) : "",
        duration: s.slotDurationMinutes ?? 60,
      }))
    );
  }

  const update = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const onSave = () =>
    save.mutate(
      rows.map((r, i) => ({
        projectId: r.projectId,
        slotStartAt: r.start || undefined,
        slotDurationMinutes: r.duration || undefined,
        slotOrder: i,
      }))
    );

  if (!slots || slots.length === 0) {
    return <EmptyState icon={CalendarClock} title={t("reviewBoard.noSlotProjects")} className="min-h-32 border-none p-4" />;
  }

  return (
    <div className="space-y-3 py-2">
      <p className="text-xs text-muted-foreground">{t("reviewBoard.slotHint")}</p>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.projectId} className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              {i + 1}. {r.projectTitle}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("reviewBoard.slotStart")}</label>
                <Input type="datetime-local" value={r.start} onChange={(e) => update(i, { start: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("reviewBoard.slotDuration")}</label>
                <Input
                  type="number"
                  min={5}
                  value={r.duration}
                  onChange={(e) => update(i, { duration: Number(e.target.value) })}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <Button size="sm" onClick={onSave} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
        {t("reviewBoard.saveSlots")}
      </Button>
    </div>
  );
}
