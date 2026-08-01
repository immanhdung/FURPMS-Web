import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Layers, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import {
  useDuplicateRubricTemplateMutation,
  useRubricTemplatesFullQuery,
  useSaveRubricScopesMutation,
  useUpdateRubricTemplateMutation,
} from "@/hooks/useRubricTemplates";
import type { RubricTemplateFull } from "@/types/rubric-template";

/**
 * Quản lý "Bộ tiêu chí": 1 bộ = nhiều tiêu chí, gắn cho loại đề tài (Cơ bản/Ứng dụng) và
 * cho nhiều (đợt + lĩnh vực). Mỗi (đợt + lĩnh vực + loại vòng) chỉ 1 bộ — lĩnh vực đã bị bộ
 * khác giữ thì BE trả 409 nêu rõ tên bộ đó.
 */
export function RubricTemplatesPanel() {
  const { t } = useTranslation();
  const { data: templates, isLoading } = useRubricTemplatesFullQuery();
  const updateMutation = useUpdateRubricTemplateMutation();
  const duplicateMutation = useDuplicateRubricTemplateMutation();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return <EmptyState icon={Layers} title={t("rubricSet.none")} description={t("rubricSet.noneDesc")} />;
  }

  return (
    <div className="space-y-3">
      {templates.map((tpl) => (
        <Card key={tpl.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                <Badge variant="secondary">{t(`reviewBoard.type.${tpl.templateType}`, tpl.templateType)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {t("rubricSet.criteriaCount", { n: tpl.criteria.length })}
                </span>
                {tpl.scopes.length > 0 && (
                  <Badge variant="outline">{t("rubricSet.scopeCount", { n: tpl.scopes.length })}</Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  disabled={duplicateMutation.isPending}
                  onClick={() => duplicateMutation.mutate(tpl.id)}
                >
                  <Copy className="size-3.5" />
                  {t("rubricSet.duplicate")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                >
                  {expandedId === tpl.id ? t("common.close") : t("rubricSet.configure")}
                </Button>
              </div>
            </div>

            {/* Loại đề tài áp dụng — rào chắn khi gắn vào đợt (đợt đã gắn chặt 1 loại). */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground">{t("rubricSet.appliesTo")}</span>
              {(["appliesBasic", "appliesApplied"] as const).map((field) => (
                <label key={field} className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-[var(--color-primary)]"
                    checked={tpl[field]}
                    onChange={(e) =>
                      updateMutation.mutate({ id: tpl.id, payload: { [field]: e.target.checked } })
                    }
                  />
                  {field === "appliesBasic" ? t("rubricSet.basic") : t("rubricSet.applied")}
                </label>
              ))}
            </div>

            {expandedId === tpl.id && <ScopeEditor template={tpl} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Tick lĩnh vực trong từng đợt để bộ này khả dụng ở đó. */
function ScopeEditor({ template }: { template: RubricTemplateFull }) {
  const { t } = useTranslation();
  const { data: cycles } = useCyclesQuery();
  const saveMutation = useSaveRubricScopesMutation();

  const [selected, setSelected] = useState<{ cycleId: number; trackId: number }[]>(
    template.scopes.map((s) => ({ cycleId: s.cycleId, trackId: s.trackId }))
  );

  const isOn = (cycleId: number, trackId: number) =>
    selected.some((s) => s.cycleId === cycleId && s.trackId === trackId);

  const toggle = (cycleId: number, trackId: number) =>
    setSelected((prev) =>
      isOn(cycleId, trackId)
        ? prev.filter((s) => !(s.cycleId === cycleId && s.trackId === trackId))
        : [...prev, { cycleId, trackId }]
    );

  // Chỉ hiện đợt đúng loại mà bộ này áp dụng (rào chắn tránh gắn nhầm).
  const eligible = (cycles ?? []).filter((c) => {
    const isApplied = Boolean((c as { requireOrderingUnit?: boolean }).requireOrderingUnit);
    return isApplied ? template.appliesApplied : template.appliesBasic;
  });

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{t("rubricSet.scopeHint")}</p>

      {eligible.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("rubricSet.noEligibleCycle")}</p>
      ) : (
        eligible.map((c) => (
          <CycleTrackPicker key={c.id} cycleId={Number(c.id)} cycleName={c.name} isOn={isOn} toggle={toggle} />
        ))
      )}

      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate({ id: template.id, payload: { entries: selected } })}
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

function CycleTrackPicker({
  cycleId,
  cycleName,
  isOn,
  toggle,
}: {
  cycleId: number;
  cycleName: string;
  isOn: (cycleId: number, trackId: number) => boolean;
  toggle: (cycleId: number, trackId: number) => void;
}) {
  const { data: tracks } = useTracksByCycleQuery(cycleId);
  if (!tracks || tracks.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{cycleName}</p>
      <div className="flex flex-wrap gap-3">
        {tracks.map((tr) => (
          <label key={tr.id} className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="size-3.5 accent-[var(--color-primary)]"
              checked={isOn(cycleId, Number(tr.id))}
              onChange={() => toggle(cycleId, Number(tr.id))}
            />
            {tr.name}
          </label>
        ))}
      </div>
    </div>
  );
}
