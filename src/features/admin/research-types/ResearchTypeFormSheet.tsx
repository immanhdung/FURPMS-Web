import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
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
      <FormField label="Name" htmlFor="rt-name" required error={errors.name?.message}>
        <Input id="rt-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Code"
          htmlFor="rt-code"
          required
          error={errors.code?.message}
          helperText={isEdit ? "Locked after creation" : undefined}
        >
          <Input id="rt-code" disabled={isEdit} aria-invalid={Boolean(errors.code)} {...register("code")} />
        </FormField>

        <FormField label="Max budget cap (VND)" htmlFor="rt-budget" required error={errors.maxBudgetCap?.message}>
          <Input
            id="rt-budget"
            type="number"
            step="1"
            aria-invalid={Boolean(errors.maxBudgetCap)}
            {...register("maxBudgetCap", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <Controller
        control={control}
        name="requireOrderingUnit"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground transition-colors hover:bg-muted/60">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium">Requires an ordering unit</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Applies to Applied Research proposals.</span>
            </span>
          </label>
        )}
      />
    </FormSheet>
  );
}
