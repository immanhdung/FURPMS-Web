import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCycleMutation, useUpdateCycleMutation } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { cycleSchema, type CycleFormValues } from "@/features/admin/cycles/cycle.schema";
import type { Cycle } from "@/types/cycle";

interface CycleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: Cycle | null;
}

export function CycleFormSheet({ open, onOpenChange, cycle }: CycleFormSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(cycle);
  const { data: researchTypes } = useResearchTypesQuery();
  const createMutation = useCreateCycleMutation();
  const updateMutation = useUpdateCycleMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: "",
      academicYear: "",
      researchTypeId: 0,
      submissionStartDate: "",
      submissionDeadline: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        cycle
          ? {
              name: cycle.name,
              academicYear: cycle.academicYear,
              researchTypeId: cycle.researchTypeId,
              submissionStartDate: dayjs(cycle.submissionStartDate).format("YYYY-MM-DD"),
              submissionDeadline: dayjs(cycle.submissionDeadline).format("YYYY-MM-DD"),
              description: cycle.description ?? "",
            }
          : {
              name: "",
              academicYear: "",
              researchTypeId: 0,
              submissionStartDate: "",
              submissionDeadline: "",
              description: "",
            }
      );
    }
  }, [open, cycle, reset]);

  const onSubmit = (values: CycleFormValues) => {
    const payload = { ...values, description: values.description || undefined };
    if (isEdit && cycle) {
      updateMutation.mutate({ id: cycle.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t("cycles.editTitle") : t("cycles.createTitle")}
      description={t("cycles.formDesc")}
      formId="cycle-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.saveChanges") : t("common.create")}
    >
      <div>
        <label htmlFor="cycle-name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.name")}
        </label>
        <Input id="cycle-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="cycle-year" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("cycles.academicYear")}
        </label>
        <Input id="cycle-year" placeholder="2025-2026" aria-invalid={Boolean(errors.academicYear)} {...register("academicYear")} />
        {errors.academicYear && <p className="mt-1 text-xs text-destructive">{errors.academicYear.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("cycles.researchType")}</label>
        <Controller
          control={control}
          name="researchTypeId"
          render={({ field }) => (
            <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger aria-invalid={Boolean(errors.researchTypeId)}>
                <SelectValue placeholder={t("cycles.researchTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {researchTypes?.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.researchTypeId && <p className="mt-1 text-xs text-destructive">{errors.researchTypeId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cycle-start" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("cycles.submissionStart")}
          </label>
          <Input id="cycle-start" type="date" aria-invalid={Boolean(errors.submissionStartDate)} {...register("submissionStartDate")} />
          {errors.submissionStartDate && (
            <p className="mt-1 text-xs text-destructive">{errors.submissionStartDate.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="cycle-deadline" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("cycles.submissionDeadline")}
          </label>
          <Input id="cycle-deadline" type="date" aria-invalid={Boolean(errors.submissionDeadline)} {...register("submissionDeadline")} />
          {errors.submissionDeadline && (
            <p className="mt-1 text-xs text-destructive">{errors.submissionDeadline.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cycle-description" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.description")}
        </label>
        <Textarea id="cycle-description" rows={4} {...register("description")} />
      </div>
    </FormSheet>
  );
}
