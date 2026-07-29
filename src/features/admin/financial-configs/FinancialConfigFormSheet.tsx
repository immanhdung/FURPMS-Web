import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateFinancialConfigMutation, useUpdateFinancialConfigMutation } from "@/hooks/useFinancialConfigs";
import {
  financialConfigSchema,
  type FinancialConfigFormValues,
} from "@/features/admin/financial-configs/financial-config.schema";
import type { FinancialConfig } from "@/types/financial-config";

interface FinancialConfigFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: FinancialConfig | null;
}

export function FinancialConfigFormSheet({ open, onOpenChange, config }: FinancialConfigFormSheetProps) {
  const isEdit = Boolean(config);
  const createMutation = useCreateFinancialConfigMutation();
  const updateMutation = useUpdateFinancialConfigMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FinancialConfigFormValues>({
    resolver: zodResolver(financialConfigSchema),
    defaultValues: { code: "", value: 0, description: "", effectiveDate: "", isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        config
          ? {
              code: config.code,
              value: config.value,
              description: config.description ?? "",
              effectiveDate: dayjs(config.effectiveDate).format("YYYY-MM-DD"),
              isActive: config.isActive,
            }
          : { code: "", value: 0, description: "", effectiveDate: "", isActive: true }
      );
    }
  }, [open, config, reset]);

  const onSubmit = (values: FinancialConfigFormValues) => {
    const payload = { ...values, description: values.description || undefined };
    if (isEdit && config) {
      updateMutation.mutate({ id: config.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Financial Configuration" : "Create Financial Configuration"}
      description="System-wide financial parameters such as coefficients and caps."
      formId="financial-config-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <FormField label="Code" htmlFor="fc-code" required error={errors.code?.message}>
        <Input id="fc-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Value" htmlFor="fc-value" required error={errors.value?.message}>
          <Input
            id="fc-value"
            type="number"
            step="any"
            className="tabular-nums"
            aria-invalid={Boolean(errors.value)}
            {...register("value", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Effective date" htmlFor="fc-effective" required error={errors.effectiveDate?.message}>
          <Input id="fc-effective" type="date" aria-invalid={Boolean(errors.effectiveDate)} {...register("effectiveDate")} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="fc-description" helperText="Optional context for this configuration.">
        <Textarea id="fc-description" rows={3} {...register("description")} />
      </FormField>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            Active
          </label>
        )}
      />
    </FormSheet>
  );
}
