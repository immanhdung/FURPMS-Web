import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { CYCLE_STATUS } from "@/constants/statuses";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function Step1CycleFieldType({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const { t } = useTranslation();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const { data: cycles, isLoading: isCyclesLoading } = useCyclesQuery();
  const selectedCycleId = watch("cycleId");
  const { data: tracks, isLoading: isTracksLoading } = useTracksByCycleQuery(selectedCycleId || undefined);
  const { data: researchTypes } = useResearchTypesQuery();

  const openCycles = (cycles ?? []).filter((c) => c.status?.toUpperCase() === CYCLE_STATUS.OPEN);
  // API có thể serialize id dạng string ⇒ so sánh phải coerce, nếu không lookup fail (loại về 0).
  const eq = (a?: number | string, b?: number | string) => Number(a) === Number(b);
  const typeName = (id?: number) => researchTypes?.find((rt) => eq(rt.id, id))?.name;
  // Loại đề tài do ĐỢT quy định (rule #7: 1 đợt = 1 loại) — không cho PI chọn.
  // Tra trong TẤT CẢ đợt để draft mở lại (đợt có thể đã đóng) vẫn suy được loại.
  const selectedCycle = (cycles ?? []).find((c) => eq(c.id, selectedCycleId));
  const selectedType = researchTypes?.find((rt) => eq(rt.id, selectedCycle?.researchTypeId));

  // researchType là SUY RA thuần từ đợt — đồng bộ mọi khi đợt đổi (kể cả draft reset / điền mẫu),
  // không chỉ dựa vào onValueChange, tránh kẹt ở 0 làm validation chặn "Tiếp tục".
  useEffect(() => {
    if (selectedCycle && !eq(watch("researchType"), selectedCycle.researchTypeId)) {
      setValue("researchType", selectedCycle.researchTypeId, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycle?.researchTypeId]);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("wizard.step1.cycle")}</label>
        <Controller
          control={control}
          name="cycleId"
          render={({ field }) => (
            <Select
              value={field.value ? field.value.toString() : undefined}
              onValueChange={(value) => {
                const id = Number(value);
                field.onChange(id);
                setValue("trackId", ""); // fields differ per cycle — clear the previous choice
                // Loại đề tài suy TỪ ĐỢT (effect cũng đồng bộ, đây chỉ để phản hồi tức thì).
                const cycle = (cycles ?? []).find((c) => eq(c.id, id));
                if (cycle) setValue("researchType", cycle.researchTypeId, { shouldValidate: true });
              }}
              disabled={isCyclesLoading}
            >
              <SelectTrigger aria-invalid={Boolean(errors.cycleId)} className="w-full">
                <SelectValue placeholder={t("wizard.step1.selectCycle")} />
              </SelectTrigger>
              <SelectContent>
                {openCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id.toString()}>
                    {cycle.name} ({cycle.academicYear}){typeName(cycle.researchTypeId) ? ` · ${typeName(cycle.researchTypeId)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.cycleId && <p className="mt-1 text-xs text-destructive">{errors.cycleId.message}</p>}
        {!isCyclesLoading && openCycles.length === 0 && (
          <p className="mt-1 text-xs text-warning">{t("wizard.step1.noCycles")}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("wizard.step1.field")}</label>
        <Controller
          control={control}
          name="trackId"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={!selectedCycleId || isTracksLoading}
            >
              <SelectTrigger aria-invalid={Boolean(errors.trackId)} className="w-full">
                <SelectValue placeholder={selectedCycleId ? t("wizard.step1.selectField") : t("wizard.step1.chooseCycleFirst")} />
              </SelectTrigger>
              <SelectContent>
                {tracks?.map((track) => (
                  <SelectItem key={track.id} value={track.id.toString()}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.trackId && <p className="mt-1 text-xs text-destructive">{errors.trackId.message}</p>}
        {selectedCycleId && !isTracksLoading && (tracks?.length ?? 0) === 0 && (
          <p className="mt-1 text-xs text-warning">{t("wizard.step1.noFields")}</p>
        )}
      </div>

      {/* Loại đề tài — READ-ONLY, do đợt quy định (không cho PI chọn) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("wizard.step1.type")}</label>
        {selectedType ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-foreground">{selectedType.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedType.requireOrderingUnit ? t("wizard.step1.appliedHint") : t("wizard.step1.basicHint")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{t("wizard.step1.typeAuto")}</p>
            </CardContent>
          </Card>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            {t("wizard.step1.chooseCycleForType")}
          </p>
        )}
        {errors.researchType && <p className="mt-1 text-xs text-destructive">{errors.researchType.message}</p>}
      </div>
    </div>
  );
}
