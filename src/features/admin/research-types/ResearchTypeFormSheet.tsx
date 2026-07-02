import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateResearchTypeMutation, useUpdateResearchTypeMutation } from "@/hooks/useResearchTypes";
import {
  researchTypeSchema,
  type ResearchTypeFormValues,
} from "@/features/admin/research-types/research-type.schema";
import type { ResearchType } from "@/types/research-type";

interface ResearchTypeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  researchType: ResearchType | null;
}

export function ResearchTypeFormSheet({ open, onOpenChange, researchType }: ResearchTypeFormSheetProps) {
  const isEdit = Boolean(researchType);
  const createMutation = useCreateResearchTypeMutation();
  const updateMutation = useUpdateResearchTypeMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ResearchTypeFormValues>({
    resolver: zodResolver(researchTypeSchema),
    defaultValues: { code: "", name: "", maxBudgetCap: 0, requireOrderingUnit: false },
  });

  useEffect(() => {
    if (open) {
      reset(
        researchType
          ? {
              code: researchType.code,
              name: researchType.name,
              maxBudgetCap: researchType.maxBudgetCap,
              requireOrderingUnit: researchType.requireOrderingUnit,
            }
          : { code: "", name: "", maxBudgetCap: 0, requireOrderingUnit: false }
      );
    }
  }, [open, researchType, reset]);

  const onSubmit = (values: ResearchTypeFormValues) => {
    if (isEdit && researchType) {
      updateMutation.mutate(
        {
          id: researchType.id,
          payload: {
            name: values.name,
            maxBudgetCap: values.maxBudgetCap,
            requireOrderingUnit: values.requireOrderingUnit,
          },
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Research Type" : "Create Research Type"}
      description="Configure a research type used when opening a cycle."
      formId="research-type-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <div>
        <label htmlFor="rt-code" className="mb-1.5 block text-sm font-medium text-foreground">
          Code
        </label>
        <Input id="rt-code" disabled={isEdit} aria-invalid={Boolean(errors.code)} {...register("code")} />
        {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div>
        <label htmlFor="rt-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input id="rt-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="rt-budget" className="mb-1.5 block text-sm font-medium text-foreground">
          Max budget cap (VND)
        </label>
        <Input
          id="rt-budget"
          type="number"
          step="1"
          aria-invalid={Boolean(errors.maxBudgetCap)}
          {...register("maxBudgetCap", { valueAsNumber: true })}
        />
        {errors.maxBudgetCap && <p className="mt-1 text-xs text-destructive">{errors.maxBudgetCap.message}</p>}
      </div>

      <Controller
        control={control}
        name="requireOrderingUnit"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            Requires an ordering unit (Applied Research)
          </label>
        )}
      />
    </FormSheet>
  );
}
