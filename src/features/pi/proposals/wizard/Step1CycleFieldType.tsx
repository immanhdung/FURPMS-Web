import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { CYCLE_STATUS } from "@/constants/statuses";
import { cn } from "@/lib/utils";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function Step1CycleFieldType({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const {
    control,
    formState: { errors },
  } = form;
  const { data: cycles, isLoading: isCyclesLoading } = useCyclesQuery();
  const { data: tracks, isLoading: isTracksLoading } = useTracksQuery();
  const { data: researchTypes, isLoading: isTypesLoading } = useResearchTypesQuery();

  const openCycles = (cycles ?? []).filter((c) => c.status === CYCLE_STATUS.OPEN);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Research Cycle</label>
        <Controller
          control={control}
          name="cycleId"
          render={({ field }) => (
            <Select
              value={field.value ? field.value.toString() : undefined}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={isCyclesLoading}
            >
              <SelectTrigger aria-invalid={Boolean(errors.cycleId)} className="w-full">
                <SelectValue placeholder="Select an open cycle" />
              </SelectTrigger>
              <SelectContent>
                {openCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id.toString()}>
                    {cycle.name} ({cycle.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.cycleId && <p className="mt-1 text-xs text-destructive">{errors.cycleId.message}</p>}
        {!isCyclesLoading && openCycles.length === 0 && (
          <p className="mt-1 text-xs text-warning">No cycles are currently open for submission.</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Research Field</label>
        <Controller
          control={control}
          name="trackId"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isTracksLoading}>
              <SelectTrigger aria-invalid={Boolean(errors.trackId)} className="w-full">
                <SelectValue placeholder="Select a research field" />
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
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Research Type</label>
        <Controller
          control={control}
          name="researchType"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {researchTypes?.map((type, index) => {
                const isSelected = field.value === type.id;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.05 }}
                  >
                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => field.onChange(type.id)}
                      onKeyDown={(e) => e.key === "Enter" && field.onChange(type.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected ? "border-primary ring-1 ring-primary" : "hover:border-primary/40"
                      )}
                    >
                      <CardContent className="flex items-start justify-between gap-2 p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{type.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {type.requireOrderingUnit
                              ? "Based on an imported topic from an ordering unit"
                              : "Upload your own research paper (PDF/DOCX)"}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        />
        {errors.researchType && <p className="mt-1 text-xs text-destructive">{errors.researchType.message}</p>}
        {isTypesLoading && <p className="mt-1 text-xs text-muted-foreground">Loading research types...</p>}
      </div>
    </div>
  );
}
